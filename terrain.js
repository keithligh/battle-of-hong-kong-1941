/* =====================================================================
 *  terrain.js, the static world: tile loading + compositing, the real
 *  height-mesh + sea + place/terrain labels + the Gin Drinkers line + the
 *  moving front. loadTiles() fills projection's geo-state via setGeo/setHeight;
 *  imageryTex is private (only buildTerrain reads it). seaMesh / placeLabels /
 *  gdlLabel / frontLabel export live for the loop + decollide.
 * ===================================================================== */
import { CFG, D, bootMsg, smooth, clamp } from "./config.js";
import { scene, sun, renderer } from "./core.js";
import { lng2tx, lat2ty, tx2lng, ty2lat, lng2mx, lat2my,
         setGeo, setHeight, sampleHeightPx, vec, MAPW, MAPD, M2U } from "./projection.js";
import { lookTarget } from "./state.js";

/* ===================== TILE LOADING / COMPOSITING ================= */
function loadImg(src){ return new Promise((res,rej)=>{ const im=new Image();
  im.onload=()=>res(im); im.onerror=()=>rej(new Error("地形瓦片載入失敗 / tile failed to load: "+src)); im.src=src; }); }

let imageryTex=null;
export async function loadTiles(){
  const g=CFG.GEO, z=g.Z;
  const x0=lng2tx(g.minLng,z), x1=lng2tx(g.maxLng,z);
  const y0=lat2ty(g.maxLat,z), y1=lat2ty(g.minLat,z);   // north has smaller y
  const nx=x1-x0+1, ny=y1-y0+1;
  // mercator bounds from tile-grid edges (so geometry aligns to imagery)
  const mx0=lng2mx(tx2lng(x0,z)), mx1=lng2mx(tx2lng(x1+1,z));
  const myn=lat2my(ty2lat(y0,z)), mys=lat2my(ty2lat(y1+1,z));
  setGeo(mx0,mx1,myn,mys);

  // --- DEM → heightData ---
  bootMsg("載入真實地形高程 (DEM)…");
  const dem=document.createElement("canvas"); dem.width=nx*256; dem.height=ny*256;
  const dctx=dem.getContext("2d",{willReadFrequently:true});
  dctx.fillStyle="rgb(128,0,0)"; dctx.fillRect(0,0,dem.width,dem.height);   // 0 m baseline → a missing DEM tile reads as sea level, not a -32768 m pit
  const total=nx*ny; let demFail=0, imgFail=0;
  const demJobs=[];
  for(let x=x0;x<=x1;x++) for(let y=y0;y<=y1;y++)
    demJobs.push(loadImg(`lib/tiles/dem/${z}_${x}_${y}.png`).then(im=>dctx.drawImage(im,(x-x0)*256,(y-y0)*256)).catch(()=>{demFail++;}));
  await Promise.all(demJobs);   // each job resolves (catch swallows the reject) → one missing tile no longer aborts the whole mosaic
  const demW=dem.width, demH=dem.height;
  const px=dctx.getImageData(0,0,demW,demH).data;
  const heightData=new Float32Array(demW*demH);
  for(let i=0;i<heightData.length;i++){ const j=i*4;
    heightData[i]=(px[j]*256 + px[j+1] + px[j+2]/256) - 32768; }
  setHeight(heightData, demW, demH);

  // --- imagery → texture (graded for a documentary look) ---
  bootMsg("載入衛星影像…");
  const maxT=Math.min(renderer.capabilities.maxTextureSize||4096, CFG.MAX_IMAGERY_TEX);   // cap on the long side → integrated-GPU memory safety (inert on HK's 2816px native)
  const nativeW=nx*256, nativeH=ny*256, scale=Math.min(1, maxT/Math.max(nativeW,nativeH));
  const img=document.createElement("canvas"); img.width=Math.round(nativeW*scale); img.height=Math.round(nativeH*scale);
  const ictx=img.getContext("2d");
  ictx.fillStyle="#16242c"; ictx.fillRect(0,0,img.width,img.height);   // neutral fill → a missing imagery tile is a dark patch, not transparent
  ictx.filter=CFG.GRADE.filter;
  const imgJobs=[];
  for(let x=x0;x<=x1;x++) for(let y=y0;y<=y1;y++)
    imgJobs.push(loadImg(`lib/tiles/img/${z}_${x}_${y}.jpg`).then(im=>
      ictx.drawImage(im,(x-x0)*256*scale,(y-y0)*256*scale,256*scale,256*scale)).catch(()=>{imgFail++;}));
  await Promise.all(imgJobs);
  if(demFail>total*0.25 || imgFail>total*0.25)   // tolerate gaps; only fail if too much is missing to be usable
    throw new Error(`地圖瓦片缺失過多 / too many map tiles missing (DEM ${demFail}/${total}, imagery ${imgFail}/${total}) · 請重新執行 tools/fetch_tiles.ps1`);
  if(demFail||imgFail) console.warn(`地圖瓦片 / map tiles: ${demFail} DEM + ${imgFail} imagery missing; rendered with gaps`);
  applyArchivalGrade(ictx,img.width,img.height);   // vignette + faint grain over the graded tiles
  imageryTex=new THREE.CanvasTexture(img);
  imageryTex.colorSpace=THREE.SRGBColorSpace || undefined;
  imageryTex.encoding=THREE.sRGBEncoding;
  imageryTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  imageryTex.needsUpdate=true;
}

// Archival pass over the composited imagery: a soft vignette (periphery only; centre/battle area stays
// clear) plus faint film grain, so the present-day satellite mosaic reads as aged documentary footage.
function applyArchivalGrade(ctx,w,h){
  ctx.filter="none";
  const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.30, w/2,h/2,Math.max(w,h)*0.62);
  vg.addColorStop(0,"rgba(28,20,10,0)"); vg.addColorStop(1,`rgba(18,12,6,${CFG.GRADE.vignette})`);
  ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
  ctx.globalAlpha=CFG.GRADE.grain; const n=Math.min(18000,(w*h)/130);
  for(let i=0;i<n;i++){ ctx.fillStyle=(i&1)?"#fff":"#000"; ctx.fillRect(Math.random()*w,Math.random()*h,1,1); }
  ctx.globalAlpha=1;
}

/* ===================== REAL TERRAIN + SEA ======================== */
export let seaMesh;
export function buildTerrain(){
  bootMsg("塑造真實地形…");
  const seg=CFG.TERR_SEG;
  const geo=new THREE.PlaneGeometry(MAPW, MAPD, seg, seg);
  geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position, uv=geo.attributes.uv, n=pos.count;
  for(let i=0;i<n;i++){
    const wx=pos.getX(i), wz=pos.getZ(i);
    const u=(wx+MAPW/2)/MAPW, vS=(wz+MAPD/2)/MAPD;   // vS: 0 north → 1 south
    let y=sampleHeightPx(u,vS)*M2U*CFG.VEXAG;
    const edge=smooth(0.05,0,Math.min(u,1-u,vS,1-vS)); // sink periphery below sea → no floating-slab edge
    y=y*(1-edge)-90*edge;
    pos.setY(i, y);
    uv.setXY(i, u, 1-vS);                            // align imagery (north up)
  }
  geo.computeVertexNormals();
  const terrain=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map:imageryTex, roughness:0.96, metalness:0.0 }));
  scene.add(terrain);
  // static cast-shadows for relief form; the sun direction is FIXED (no arc) so shadows never move;
  // day/night stays intensity/colour-driven (honours the standing "no moving shadows" directive).
  terrain.castShadow=true; terrain.receiveShadow=true;
  sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  { const S=Math.max(MAPW,MAPD)*0.72, sc=sun.shadow.camera;
    sc.left=-S; sc.right=S; sc.top=S; sc.bottom=-S; sc.near=50; sc.far=5000; sc.updateProjectionMatrix();
    sun.shadow.bias=-0.0006; sun.shadow.normalBias=1.4; }

  // sea: a STATIC, matte, slightly-translucent surface just below the coastline.
  // (No wave animation + low reflectivity + depthWrite:false → no sweeping specular
  //  highlights and no z-fighting where it meets the shore, i.e. no "moving shadows".)
  const sg=new THREE.PlaneGeometry(MAPW*1.4, MAPD*1.4); sg.rotateX(-Math.PI/2);
  seaMesh=new THREE.Mesh(sg, new THREE.MeshStandardMaterial({
    color:0x14323f, roughness:0.88, metalness:0.04, transparent:true, opacity:0.88, depthWrite:false }));
  // MATTE (roughness 0.88, low metalness). A glossy sheen sweeps a moving specular highlight as the camera
  // orbits → the "sea flicker". Reverted to matte (the HKBattleSeaShimmer known-good); deeper tone +
  // opacity 0.88 kept (continuous open water; helps the waterline rim).
  seaMesh.position.y=-0.2; scene.add(seaMesh);
}

/* ===================== PLACE / TERRAIN LABELS ===================== */
const labelGroup=new THREE.Group(); scene.add(labelGroup);
export const placeLabels=[];
function addPlaceLabel(p, cls, off){
  const d=document.createElement("div"); d.className="lbl "+cls;
  d.innerHTML=`<div class="zh">${p.name_zh}</div><div class="en">${p.name_en}</div>`;
  const o=new THREE.CSS2DObject(d); o.position.copy(vec(p.lng,p.lat,off));
  labelGroup.add(o); placeLabels.push({o,div:d,cls});
}
export function buildLabels(){
  D.geography.regions.forEach(r=>addPlaceLabel(r,"region",CFG.LBL_REGION));
  D.geography.points.forEach(p=>{
    const cls=p.h>0?"peak":(p.type==="fort"?"fort":(p.type==="bay"||p.type==="channel"?"bay":"town"));
    const off=p.h>0?CFG.LBL_PEAK:(cls==="fort"?CFG.LBL_FORT:CFG.LBL_TOWN);
    addPlaceLabel(p,cls,off);
  });
}

/* ---- defensive line (Gin Drinkers) + moving front line ---------- *
 *  Both are explained in the on-screen legend (#key) AND carry an
 *  on-map label, so the audience knows what each line means.
 * ---------------------------------------------------------------- */
function geoCurve(path, yOff){ return new THREE.CatmullRomCurve3(path.map(p=>vec(p[0],p[1],yOff)), false, "catmullrom", 0.4); }
function lineLabel(zh,en,color){ const d=document.createElement("div"); d.className="lbl linelbl";
  d.innerHTML=`<div class="zh" style="color:${color}">${zh}</div><div class="en">${en}</div>`;
  const o=new THREE.CSS2DObject(d); labelGroup.add(o); return {o,div:d}; }

let gdlMesh=null; export let gdlLabel=null;
export function buildLine(){
  const curve=geoCurve(D.geography.lines[0].path, 12);
  gdlMesh=new THREE.Mesh(new THREE.TubeGeometry(curve,120,2.0,8,false),
    new THREE.MeshBasicMaterial({color:0x6fa0d8, transparent:true, opacity:0}));
  scene.add(gdlMesh);
  gdlLabel=lineLabel("醉酒灣防線","Gin Drinkers Line","#6fa0d8");
  const m=curve.getPoint(0.5); gdlLabel.o.position.set(m.x, m.y+CFG.LBL_FORT, m.z);
}
// The Gin Drinkers Line matters only while the mainland is held (8–13 Dec);
// fade it out as the line collapses so it doesn't linger over the island battle.
export function updateLines(day){
  if(!gdlMesh) return;
  const op = day<10.5 ? 0.6 : clamp((13-day)/2.5,0,1)*0.6;
  gdlMesh.material.opacity=op; gdlMesh.visible=op>0.02;
  gdlLabel.o.visible=op>0.05; gdlLabel.div.style.opacity=clamp(op/0.6,0,1);
}

const frontGroup=new THREE.Group(); scene.add(frontGroup);
let frontMesh=null, frontIdx=-1; export let frontLabel=null;
export function updateFront(day){
  let idx=-1; for(let i=0;i<D.fronts.length;i++){ if(D.fronts[i].d<=day) idx=i; }
  if(idx===frontIdx) return; frontIdx=idx;
  if(frontMesh){ frontGroup.remove(frontMesh); frontMesh.geometry.dispose(); frontMesh=null; }
  if(!frontLabel) frontLabel=lineLabel("戰線","Front line","#ffb24a");
  if(idx<0){ frontLabel.o.visible=false; return; }
  const curve=geoCurve(D.fronts[idx].path,16);
  frontMesh=new THREE.Mesh(new THREE.TubeGeometry(curve,80,2.4,8,false),
    new THREE.MeshBasicMaterial({color:0xffb24a, transparent:true, opacity:0.8}));
  frontGroup.add(frontMesh);
  const m=curve.getPoint(0.5); frontLabel.o.position.set(m.x, m.y+CFG.LBL_FORT, m.z); frontLabel.o.visible=true;
}

/* ---- place-label focus: show only the nearest few names by camera distance ---- */
const _rankIdx=[];   // reused across frames; rank place labels by camera distance with no per-frame allocation
export function updateLabels(){ const NE=CFG.FOCUS.PLACE_NEAR, FA=CFG.FOCUS.PLACE_FAR, K=CFG.FOCUS.MAX_PLACES, n=placeLabels.length;
  if(_rankIdx.length!==n){ _rankIdx.length=0; for(let i=0;i<n;i++) _rankIdx.push(i); }   // rebuild only if the label set changes
  for(let i=0;i<n;i++) placeLabels[i]._d=lookTarget.distanceTo(placeLabels[i].o.position);
  _rankIdx.sort((a,b)=>placeLabels[a]._d-placeLabels[b]._d);   // in-place sort of the reused index array
  for(let idx=0;idx<n;idx++){ const l=placeLabels[_rankIdx[idx]], d=l._d;
    const op=(idx<K && d<FA)? clamp((FA-d)/(FA-NE),0.18,1) : 0;
    l.div.style.display = op>0.02?"":"none"; l.div.style.opacity=op; } }
