/* =====================================================================
 *  projection.js: Web-Mercator projection + terrain elevation (the SSOT
 *  for lng/lat → world position and for ground height). The geo-bounds and
 *  the composed DEM are filled by terrain.loadTiles() via setGeo()/setHeight();
 *  every other reader goes through project()/sampleHeight()/vec(), so the raw
 *  bounds stay private to this module. Imports config only.
 * ===================================================================== */
import { CFG, deg, clamp } from "./config.js";

const RE = 6378137;
export const lng2mx = l => RE*l*deg;
export const lat2my = la => RE*Math.log(Math.tan(Math.PI/4 + la*deg/2));
export const lng2tx = (l,z)=>Math.floor((l+180)/360*Math.pow(2,z));
export const lat2ty = (la,z)=>{ const r=la*deg; return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z)); };
export const tx2lng = (x,z)=>x/Math.pow(2,z)*360-180;
export const ty2lat = (y,z)=>{ const n=Math.PI-2*Math.PI*y/Math.pow(2,z); return Math.atan(Math.sinh(n))/deg; };

let MX0,MX1,MYN,MYS;                            // mercator bounds (private)
export let MAPW=0, MAPD=0, M2U=0;               // world extents + metres→units scale (read by terrain.buildTerrain)
let demW=0, demH=0, heightData=null;            // composed DEM (private; read via sampleHeightPx)

// Set the mercator bounds from the tile-grid edges, then derive the world scale + extents.
export function setGeo(mx0,mx1,myn,mys){
  MX0=mx0; MX1=mx1; MYN=myn; MYS=mys;
  M2U=CFG.TARGET_UNITS/(MX1-MX0); MAPW=(MX1-MX0)*M2U; MAPD=(MYN-MYS)*M2U;
}
export function setHeight(data,w,h){ heightData=data; demW=w; demH=h; }

export function project(lng,lat){ return { X:(lng2mx(lng)-MX0)*M2U-MAPW/2, Z:(MYN-lat2my(lat))*M2U-MAPD/2 }; }
export function sampleHeightPx(u,v){
  const fx=clamp(u,0,1)*(demW-1), fy=clamp(v,0,1)*(demH-1);
  const x0=Math.floor(fx), y0=Math.floor(fy), x1=Math.min(x0+1,demW-1), y1=Math.min(y0+1,demH-1);
  const tx=fx-x0, ty=fy-y0;
  const a=heightData[y0*demW+x0], b=heightData[y0*demW+x1], c=heightData[y1*demW+x0], d=heightData[y1*demW+x1];
  return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
}
function sampleHeight(lng,lat){
  return sampleHeightPx((lng2mx(lng)-MX0)/(MX1-MX0), (MYN-lat2my(lat))/(MYN-MYS));
}
function groundY(lng,lat){ return Math.max(sampleHeight(lng,lat)*M2U*CFG.VEXAG, 0); }
export function vec(lng,lat,yOff){ const p=project(lng,lat); return new THREE.Vector3(p.X, groundY(lng,lat)+(yOff||0), p.Z); }
