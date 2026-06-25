/* =====================================================================
 *  entities.js: everything that lives and moves on the battlefield: the
 *  unit tokens + flags, the movement arrows, the particle effects (fire /
 *  smoke / flashes), and the weather (rain + sky/light grading per day).
 *  Reads the shared frame clock (Time.now) and shot focus (focusSet) from
 *  state, and seaMesh from terrain, both one-way, so no import cycle.
 * ===================================================================== */
import { CFG, D, FAC, clamp, lerp, smooth } from "./config.js";
import { scene, controls, skyMat, sun, hemi, amb, renderer } from "./core.js";
import { vec, project } from "./projection.js";
import { flagTexture } from "./flags.js";
import { Time, focusSet } from "./state.js";
import { seaMesh } from "./terrain.js";

/* ========================= UNITS / FLAGS ========================== */
const unitsGroup=new THREE.Group(); scene.add(unitsGroup);
const flagWaves=[]; export const unitObjs=[];
// Unit glyphs: shared geometries built once and reused by every unit (less allocation than a token each).
// Combat units fly an oriented "formation wedge": a notched chevron whose tip points along the unit's
// advance vector (updateUnits sets token.rotation.y) and whose footprint scales with combat strength.
const WEDGE_GEO=(()=>{ const s=new THREE.Shape();
  s.moveTo(0,-1.0); s.lineTo(0.60,0.55); s.lineTo(0.22,0.30); s.lineTo(0,0.48);
  s.lineTo(-0.22,0.30); s.lineTo(-0.60,0.55); s.closePath();          // tip at -Y, notched wings at +Y
  const g=new THREE.ExtrudeGeometry(s,{depth:0.9, bevelEnabled:false}); // 0.9 = thin map-glyph slab
  g.rotateX(-Math.PI/2);                          // tip → world +Z (forward), thickness → +Y (up)
  g.scale(CFG.TOKEN_R*1.25,1,CFG.TOKEN_R*1.25);   // footprint ≈ the former cylinder token
  return g; })();
// Command posts are not maneuver formations; they wear a static diamond beacon, never a direction arrow.
const CMD_GEO=new THREE.OctahedronGeometry(CFG.TOKEN_R*0.62);
// Air units render as an aircraft aloft: a slender swept-wing silhouette (distinct from the fat infantry chevron),
// hovering above its ground ring so it reads as in flight. Nose at shape -Y → world +Z (forward), like the wedge.
const AIR_GEO=(()=>{ const s=new THREE.Shape();
  s.moveTo(0,-1.25); s.lineTo(0.10,-0.15); s.lineTo(0.66,0.62); s.lineTo(0.12,0.50);   // nose → fuselage → swept wingtip → trailing root
  s.lineTo(0.10,1.05); s.lineTo(-0.10,1.05);                                            // tailplane
  s.lineTo(-0.12,0.50); s.lineTo(-0.66,0.62); s.lineTo(-0.10,-0.15); s.closePath();     // left mirror
  const g=new THREE.ExtrudeGeometry(s,{depth:0.6, bevelEnabled:false});                 // a thin slab; the swept shape carries the read
  g.rotateX(-Math.PI/2); g.scale(CFG.TOKEN_R*1.45,1,CFG.TOKEN_R*1.45); return g; })();   // sized close to the infantry wedge (1.25) for proportion — a unit is a unit, just a different shape
// Naval units render as a warship hull: an elongated silhouette with a pointed bow, riding at sea level.
const NAVY_GEO=(()=>{ const s=new THREE.Shape();
  s.moveTo(0,-1.35); s.lineTo(0.30,-0.55); s.lineTo(0.32,0.95); s.lineTo(-0.32,0.95); s.lineTo(-0.30,-0.55);  // bow → sides → squared stern
  s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:1.0, bevelEnabled:false});
  g.rotateX(-Math.PI/2); g.scale(CFG.TOKEN_R*1.45,1,CFG.TOKEN_R*1.45); return g; })();
// Artillery renders as a field gun: a SOLID rectangular body (gun + wheels — a clear mass, not a wisp) with a
// stubby barrel projecting forward (+Z, along the heading). Kept solid + visible so it reads even as a dim
// background unit, distinct from the pointed wedge/delta/hull.
const ARTY_GEO=(()=>{ const s=new THREE.Shape();
  s.moveTo(0.16,-1.45); s.lineTo(0.16,-0.5);             // barrel, right edge (muzzle forward at -1.45)
  s.lineTo(0.52,-0.5); s.lineTo(0.52,0.85); s.lineTo(-0.52,0.85); s.lineTo(-0.52,-0.5);   // solid body (gun + wheels)
  s.lineTo(-0.16,-0.5); s.lineTo(-0.16,-1.45);           // barrel, left edge
  s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:1.0, bevelEnabled:false});
  g.rotateX(-Math.PI/2); g.scale(CFG.TOKEN_R*1.55,1,CFG.TOKEN_R*1.55); return g; })();
// state → formation footprint [frontage, depth] applied to the wedge so 陣型 reads per posture:
// attack=spearhead, march=narrow column, hold=broad defensive line, retreat=dispersed.
const FORM={ attack:[1,1], landing:[1.06,1.06], march:[0.62,1.18], hold:[1.5,0.55], retreat:[1.25,0.7], dead:[1,1] };
// kind → token glyph + hover height. command = diamond beacon, air = aircraft aloft, navy = ship hull; any other
// or absent kind (infantry, artillery, …) → the formation wedge at ground level (safe default, never an error).
const GEO_BY_KIND={ command:CMD_GEO, air:AIR_GEO, navy:NAVY_GEO, artillery:ARTY_GEO };
const Y_BY_KIND={ command:6, air:5, navy:2.0 };
export function buildUnit(u){
  const grp=new THREE.Group(); const f=FAC[u.faction];
  const ring=new THREE.Mesh(new THREE.RingGeometry(CFG.RING_IN,CFG.RING_OUT,40),
    new THREE.MeshBasicMaterial({color:f.glow, transparent:true, opacity:0.5, side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.y=1.5; grp.add(ring);
  const token=new THREE.Mesh(GEO_BY_KIND[u.kind]||WEDGE_GEO,
    new THREE.MeshStandardMaterial({color:f.main, emissive:f.dim, emissiveIntensity:0.3, roughness:0.62}));
  token.position.y=Y_BY_KIND[u.kind]??2.2; token.castShadow=true; grp.add(token);   // command beacon hovers; air aloft; navy at sea level; wedge just above the ground ring
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(CFG.POLE_R,CFG.POLE_R,CFG.FLAG_H+CFG.TOKEN_H,6),
    new THREE.MeshStandardMaterial({color:0x2a2620, roughness:0.8}));
  pole.position.y=(CFG.FLAG_H+CFG.TOKEN_H)/2; pole.castShadow=true; grp.add(pole);   // planted to the ground (no float over the flat wedge)
  const finial=new THREE.Mesh(new THREE.SphereGeometry(CFG.FINIAL_R,8,8),
    new THREE.MeshStandardMaterial({color:f.glow, emissive:f.glow, emissiveIntensity:0.28}));
  finial.position.y=CFG.FLAG_H+CFG.TOKEN_H; grp.add(finial);
  const fg=new THREE.PlaneGeometry(CFG.FLAG_W,CFG.FLAG_TH,16,8); fg.translate(CFG.FLAG_W/2,0,0);
  const flag=new THREE.Mesh(fg, new THREE.MeshStandardMaterial({map:flagTexture(u),
    side:THREE.DoubleSide, roughness:0.7, emissive:0x222222, emissiveIntensity:0.15, transparent:true}));
  flag.position.set(CFG.POLE_R, CFG.FLAG_H+CFG.TOKEN_H-CFG.FLAG_TH*0.6, 0); grp.add(flag);
  flag.userData.base=fg.attributes.position.array.slice(); flag.userData.phase=Math.random()*9;
  flagWaves.push(flag);
  const div=document.createElement("div"); div.className="unit "+u.faction;
  div.innerHTML=`<div class="name">${u.label_zh||u.name_zh}</div>`;   // commander shown in the caption, not on-map; label_zh = optional shorter on-map label
  const lbl=new THREE.CSS2DObject(div); lbl.position.set(0, CFG.FLAG_H+CFG.LBL_UNIT, 0); grp.add(lbl);
  unitsGroup.add(grp);
  unitObjs.push({u,grp,ring,token,flag,finial,div,lbl,
    activeStart:u.track[0].d, activeEnd:u.track[u.track.length-1].d, visible:true});
}
export function sampleTrack(track, day){
  if(day<=track[0].d) return {lng:track[0].lng,lat:track[0].lat,s:track[0].s,st:track[0].st};
  const last=track[track.length-1];
  if(day>=last.d) return {lng:last.lng,lat:last.lat,s:last.s,st:last.st};
  for(let i=0;i<track.length-1;i++){ const a=track[i], b=track[i+1];
    if(day>=a.d&&day<=b.d){ const t=(day-a.d)/(b.d-a.d||1);
      return {lng:lerp(a.lng,b.lng,t),lat:lerp(a.lat,b.lat,t),s:Math.round(lerp(a.s,b.s,t)),st:a.st}; } }
  return {lng:last.lng,lat:last.lat,s:last.s,st:last.st};
}
export function deadDay(u){ for(const k of u.track) if(k.st==="dead") return k.d; return 999; }

/* ===================== MOVEMENT ARROWS ============================ */
const arrowsGroup=new THREE.Group(); scene.add(arrowsGroup);
export const arrowObjs=[];
function makeSoftTex(){ const s=64, cv=document.createElement("canvas"); cv.width=cv.height=s;
  const c=cv.getContext("2d"); const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,"#fff"); g.addColorStop(0.4,"rgba(255,255,255,0.6)"); g.addColorStop(1,"rgba(255,255,255,0)");
  c.fillStyle=g; c.fillRect(0,0,s,s); return new THREE.CanvasTexture(cv); }
export function buildArrow(a){
  const f=FAC[a.f]; const p0=vec(a.from[0],a.from[1],14), p2=vec(a.to[0],a.to[1],14);
  const mid=p0.clone().lerp(p2,0.5); mid.y+=p0.distanceTo(p2)*0.18+20;
  const curve=new THREE.QuadraticBezierCurve3(p0,mid,p2);
  const col=a.kind==="retreat"?FAC.uk.glow:f.glow;
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,40,a.kind==="landing"?2.4:1.8,8,false),
    new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.0}));
  const tan=curve.getTangent(1).normalize();
  const head=new THREE.Mesh(new THREE.ConeGeometry(5,12,12),
    new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.0}));
  head.position.copy(p2); head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tan);
  const flows=[]; for(let i=0;i<3;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex,color:col,
    transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    sp.scale.set(9,9,9); arrowsGroup.add(sp); flows.push(sp); }
  const div=document.createElement("div"); div.className="lbl bay";
  div.innerHTML=`<div class="zh" style="font-size:11px;color:${a.f==='jp'?'#ffb0a4':'#a8c6ff'}">${a.label}</div>`;
  const lbl=new THREE.CSS2DObject(div); lbl.position.copy(mid); div.style.opacity="0";
  arrowsGroup.add(tube); arrowsGroup.add(head); arrowsGroup.add(lbl);
  arrowObjs.push({a,curve,tube,head,flows,div,lbl});
}

/* ========================= EFFECTS ================================ */
function makeParticleSystem(cap, additive, pscale){
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(cap*3), col=new Float32Array(cap*3), psize=new Float32Array(cap), alpha=new Float32Array(cap);
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  geo.setAttribute("color",new THREE.BufferAttribute(col,3));
  geo.setAttribute("psize",new THREE.BufferAttribute(psize,1));
  geo.setAttribute("alpha",new THREE.BufferAttribute(alpha,1));
  const mat=new THREE.ShaderMaterial({ transparent:true, depthWrite:false,
    blending: additive?THREE.AdditiveBlending:THREE.NormalBlending,
    uniforms:{ pscale:{value:pscale} },
    vertexShader:`uniform float pscale; attribute vec3 color; attribute float psize; attribute float alpha;
      varying vec3 vC; varying float vA;
      void main(){ vC=color; vA=alpha; vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=psize*(pscale/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying vec3 vC; varying float vA;
      void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c);
        float a=smoothstep(0.5,${additive?"0.05":"0.0"},d)*vA; if(a<=0.0) discard; gl_FragColor=vec4(vC,a); }`
  });
  const pts=new THREE.Points(geo,mat); pts.frustumCulled=false; scene.add(pts);
  return { geo,pos,col,psize,alpha,cap,cursor:0, vel:new Float32Array(cap*3),
    life:new Float32Array(cap), max:new Float32Array(cap), grow:new Float32Array(cap), kind:new Int8Array(cap), pts };
}
function emit(S,x,y,z,vx,vy,vz,size,life,r,g,b,grow,kind){
  const i=S.cursor; S.cursor=(S.cursor+1)%S.cap;
  S.pos[i*3]=x; S.pos[i*3+1]=y; S.pos[i*3+2]=z;
  S.vel[i*3]=vx; S.vel[i*3+1]=vy; S.vel[i*3+2]=vz;
  S.col[i*3]=r; S.col[i*3+1]=g; S.col[i*3+2]=b;
  S.psize[i]=size; S.life[i]=life; S.max[i]=life; S.grow[i]=grow||0; S.kind[i]=kind||0; S.alpha[i]=1;
}
function stepParticles(S,dt){
  const G=CFG.EU;
  for(let i=0;i<S.cap;i++){
    if(S.life[i]<=0){ if(S.alpha[i]!==0) S.alpha[i]=0; continue; }
    S.life[i]-=dt; const k=S.kind[i];
    if(k===1) S.vel[i*3+1]+=2*G*dt; else if(k===2) S.vel[i*3+1]+=5*G*dt; else S.vel[i*3+1]-=14*G*dt;
    S.pos[i*3]+=S.vel[i*3]*dt; S.pos[i*3+1]+=S.vel[i*3+1]*dt; S.pos[i*3+2]+=S.vel[i*3+2]*dt;
    if(S.pos[i*3+1]<1 && k!==1 && k!==2) S.life[i]=0;
    S.psize[i]+=S.grow[i]*dt;
    const lt=S.life[i]/S.max[i]; S.alpha[i]=k===1?clamp(lt*0.5,0,0.5):clamp(lt,0,1);
  }
  S.geo.attributes.position.needsUpdate=true; S.geo.attributes.color.needsUpdate=true;
  S.geo.attributes.psize.needsUpdate=true; S.geo.attributes.alpha.needsUpdate=true;
}
const flashes=[];
function buildFlashes(){ for(let i=0;i<7;i++){ const L=new THREE.PointLight(0xffaa55,0,240,2); L.visible=false; scene.add(L); flashes.push({L,life:0}); } }
function flash(x,y,z,color,intensity){ for(const fl of flashes){ if(fl.life<=0){ fl.L.color.setHex(color);
  fl.L.position.set(x,y,z); fl.L.intensity=intensity*CFG.FLASH_K; fl.L.visible=true; fl.life=0.14; return; } } }
const hotTimers={}; const rnd=(a,b)=>a+Math.random()*(b-a);
export function updateEffects(day, dt){
  const G=CFG.EU;
  for(let h=0;h<D.hotspots.length;h++){
    const hs=D.hotspots[h]; if(day<hs.a||day>hs.b) continue;
    const w=vec(hs.lng,hs.lat,0); const gx=w.x, gz=w.z, gy=w.y;
    hotTimers[h]=(hotTimers[h]||0)-dt; const fire=hotTimers[h]<=0;
    if(hs.kind==="firefight"){
      if(Math.random()<hs.i*0.9){ const c=Math.random()<0.5?[1,0.8,0.3]:[1,0.5,0.2];
        emit(GLOW,gx+rnd(-3,3)*G,gy+rnd(0.5,3)*G,gz+rnd(-3,3)*G,rnd(-6,6)*G,rnd(4,12)*G,rnd(-6,6)*G,rnd(8,16),rnd(0.3,0.6),c[0],c[1],c[2],0,0); }
      if(fire){ flash(gx,gy+2*G,gz,0xffcc66,rnd(120,260)); emit(SMOKE,gx,gy+G,gz,rnd(-1,1)*G,2*G,rnd(-1,1)*G,16,rnd(1.2,2),0.22,0.21,0.2,12,1); hotTimers[h]=rnd(0.12,0.28)/hs.i; }
    } else if(hs.kind==="artillery"){
      if(fire){ flash(gx,gy+3*G,gz,0xffd27a,rnd(220,360));
        for(let s=0;s<8;s++) emit(GLOW,gx,gy+2.5*G,gz,rnd(-10,10)*G,rnd(6,16)*G,rnd(-10,10)*G,rnd(10,18),0.4,1,0.75,0.35,0,0);
        emit(SMOKE,gx,gy+2*G,gz,rnd(-1,1)*G,2.5*G,rnd(-1,1)*G,22,2.2,0.26,0.25,0.23,16,1);
        for(let t=0;t<6;t++) emit(GLOW,gx+rnd(-2,2)*G,gy+(5+t*4)*G,gz+(10+t*7)*G,rnd(-2,2)*G,3*G,18*G,9,0.5,1,0.9,0.5,0,0);
        hotTimers[h]=rnd(0.4,0.9)/hs.i; }
    } else if(hs.kind==="explosion"){
      if(fire){ flash(gx,gy+2*G,gz,0xffaa44,rnd(300,520));
        for(let s=0;s<14;s++){ const a=Math.random()*7,sp=rnd(6,20)*G;
          emit(GLOW,gx,gy+1.5*G,gz,Math.cos(a)*sp,rnd(8,20)*G,Math.sin(a)*sp,rnd(10,22),rnd(0.3,0.6),1,0.6,0.2,0,3); }
        emit(SMOKE,gx,gy+2*G,gz,rnd(-2,2)*G,3*G,rnd(-2,2)*G,30,2.4,0.2,0.19,0.18,20,1);
        hotTimers[h]=rnd(0.7,1.6)/hs.i; }
    } else if(hs.kind==="landing"){
      if(Math.random()<0.7) emit(GLOW,gx+rnd(-6,6)*G,gy+rnd(0,2)*G,gz+rnd(-4,4)*G,rnd(-4,4)*G,rnd(6,12)*G,rnd(-4,4)*G,rnd(8,14),0.4,0.7,0.85,1,0);
      if(fire){ flash(gx,gy+1.5*G,gz,0xfff0c0,rnd(120,220));
        for(let s=0;s<6;s++) emit(GLOW,gx+rnd(-8,8)*G,gy+0.5*G,gz+rnd(-6,6)*G,rnd(-3,3)*G,rnd(3,7)*G,rnd(-3,3)*G,11,0.4,0.6,0.8,1,0,0);
        hotTimers[h]=rnd(0.3,0.6); }
    } else if(hs.kind==="oilfire"){
      for(let s=0;s<3;s++) emit(GLOW,gx+rnd(-4,4)*G,gy+rnd(0,4)*G,gz+rnd(-4,4)*G,rnd(-2,2)*G,rnd(8,16)*G,rnd(-2,2)*G,rnd(18,30),rnd(0.4,0.8),1,rnd(0.35,0.6),0.12,-12,2);
      if(fire){ for(let s=0;s<2;s++) emit(SMOKE,gx+rnd(-2,2)*G,gy+3*G,gz+rnd(-2,2)*G,rnd(0,2)*G,rnd(4,7)*G,rnd(-1,1)*G,rnd(22,34),rnd(2,3),0.15,0.14,0.13,16,1);
        flash(gx,gy+3*G,gz,0xff7733,rnd(120,200)*hs.i); hotTimers[h]=rnd(0.2,0.34); }
    } else if(hs.kind==="air"){
      if(fire){ flash(gx,gy+2*G,gz,0xffcc66,300);
        for(let s=0;s<10;s++){ const a=Math.random()*7,sp=rnd(8,16)*G;
          emit(GLOW,gx,gy+1.5*G,gz,Math.cos(a)*sp,rnd(6,14)*G,Math.sin(a)*sp,rnd(10,18),0.5,1,0.7,0.3,0,3); }
        emit(SMOKE,gx,gy+2*G,gz,0,2.5*G,0,26,2.4,0.2,0.19,0.18,18,1);
        for(let t=0;t<6;t++) emit(GLOW,gx+(rnd(-3,3)+(6-t)*4)*G,gy+(30-t*4)*G,gz+(-30+t*4)*G,rnd(-2,2)*G,-6*G,6*G,8,0.4,1,0.9,0.4,0,0);
        hotTimers[h]=rnd(0.8,1.6); }
    }
  }
  stepParticles(GLOW,dt); stepParticles(SMOKE,dt);
  flashes.forEach(fl=>{ if(fl.life>0){ fl.life-=dt; fl.L.intensity=Math.max(0,fl.L.intensity-dt*fl.L.intensity*6.5); if(fl.life<=0){ fl.life=0; fl.L.visible=false; } }});
}

/* ========================= WEATHER ================================ */
const RAIN_N=1500; let rain, rainPos, rainMat;
export function buildRain(){
  const g=new THREE.BufferGeometry(); rainPos=new Float32Array(RAIN_N*6);
  for(let i=0;i<RAIN_N;i++) resetRain(i,true);
  g.setAttribute("position",new THREE.BufferAttribute(rainPos,3));
  rainMat=new THREE.LineBasicMaterial({color:0xaebfce, transparent:true, opacity:0});
  rain=new THREE.LineSegments(g,rainMat); rain.frustumCulled=false; scene.add(rain);
}
function resetRain(i,init){ const cx=controls?controls.target.x:0, cz=controls?controls.target.z:0;
  const x=cx+rnd(-700,700), z=cz+rnd(-700,700), y=init?rnd(0,700):rnd(500,760);
  rainPos[i*6]=x; rainPos[i*6+1]=y; rainPos[i*6+2]=z; rainPos[i*6+3]=x+6; rainPos[i*6+4]=y-34; rainPos[i*6+5]=z; }
function curWeather(day){ const W=D.weather; if(day<=W[0].d) return W[0]; const last=W[W.length-1]; if(day>=last.d) return last;
  for(let i=0;i<W.length-1;i++){ const a=W[i],b=W[i+1]; if(day>=a.d&&day<=b.d){ const t=(day-a.d)/(b.d-a.d||1);
    return { night:lerp(a.night,b.night,t), fog:lerp(a.fog,b.fog,t), rain:lerp(a.rain,b.rain,t),
             smoke:lerp(a.smoke,b.smoke,t), zh:t<0.5?a.zh:b.zh, en:t<0.5?a.en:b.en }; } } return last; }
const cDay=new THREE.Color(0x6f9fd0), cDayB=new THREE.Color(0xcad9e2), cNight=new THREE.Color(0x10182c),
      cNightB=new THREE.Color(0x243349), cOver=new THREE.Color(0x5a6470), cOverB=new THREE.Color(0x808a92), cSmoke=new THREE.Color(0x4a3f3a), cSea=new THREE.Color(0x14323f);
const _t=new THREE.Color(), _b=new THREE.Color();
export function applyWeather(day){
  const w=curWeather(day), overcast=clamp(Math.max(w.rain,w.smoke*0.6),0,1);
  _t.copy(cDay).lerp(cOver,overcast).lerp(cNight,w.night);
  _b.copy(cDayB).lerp(cOverB,overcast).lerp(cNightB,w.night).lerp(cSmoke,w.smoke*0.4);
  skyMat.uniforms.top.value.copy(_t); skyMat.uniforms.bot.value.copy(_b);
  scene.fog.color.copy(_b); scene.fog.density=0.00012 + w.fog*0.00055 + w.smoke*0.00022;
  sun.intensity=lerp(1.2,0.1,w.night)*(1-0.55*overcast);
  sun.color.setHex(w.night>0.5?0x8ea6cf:0xfff1d6);
  hemi.intensity=lerp(0.5,0.22,w.night)*(1-0.3*overcast);
  amb.intensity=lerp(0.45,0.36,w.night); amb.color.setHex(w.night>0.5?0x1c2a44:0x404a55);
  renderer.toneMappingExposure=lerp(1.08,0.78,w.night);
  if(seaMesh) seaMesh.material.color.copy(cSea).lerp(cNight,w.night*0.8);
  if(rainMat){ rainMat.opacity=clamp(w.rain*0.6,0,0.6); rain.visible=w.rain>0.02; }
  return w;
}
export function stepRain(dt,w){ if(!rain||!rain.visible) return; const fall=720*dt*(0.6+w.rain);
  for(let i=0;i<RAIN_N;i++){ rainPos[i*6+1]-=fall; rainPos[i*6+4]-=fall; if(rainPos[i*6+1]<0) resetRain(i,false); }
  rain.geometry.attributes.position.needsUpdate=true; }

/* ===================== per-frame entity updates ================== */
export function updateUnits(day){
  const DIM=CFG.FOCUS.UNIT_DIM;
  unitObjs.forEach(o=>{
    const u=o.u, vis=day>=o.activeStart-0.4 && day<=o.activeEnd+1.4;
    o.grp.visible=vis; o.visible=vis; if(!vis){ o.lbl.visible=false; o.div.style.opacity=0; return; }   // inactive units: hide the CSS2D label too (grp.visible=false alone does NOT hide it → it leaks at the map origin)
    const s=sampleTrack(u.track,day);
    const dead=s.st==="dead" && day>=(deadDay(u)-0.01);
    const w=vec(s.lng,s.lat,0); o.grp.position.copy(w);
    const ah=sampleTrack(u.track,Math.min(day+0.4,o.activeEnd)); const pa=project(ah.lng,ah.lat);
    const dx=pa.X-w.x, dz=pa.Z-w.z; if(dx*dx+dz*dz>1) o.token.rotation.y=Math.atan2(dx,dz);
    if(u.cf){ const sc=0.6+clamp(s.s/2200,0,1.6);
      const fm=GEO_BY_KIND[u.kind]?[1,1]:(FORM[s.st]||FORM.attack);   // posture-formation shaping is for the infantry wedge only; the distinct glyphs (air/navy/artillery) keep their silhouette, sized by strength
      o.token.scale.set(sc*fm[0],1,sc*fm[1]); }
    const f=FAC[u.faction], focused=focusSet.has(u.id);
    // every on-stage unit flies its national/service flag; focus only emphasises.
    o.flag.visible=true; o.flag.material.opacity=focused?1:0.5; o.finial.visible=focused;
    o.lbl.visible=focused; o.div.style.opacity=focused?(dead?0.65:1):0;   // text labels stay focus-only (no clutter)
    if(dead){ o.token.material.color.setHex(0x55585c); o.token.material.emissiveIntensity=focused?0.06:0.0;
      o.ring.material.opacity=focused?0.4:DIM; o.flag.rotation.z=-0.5; o.flag.position.y=(CFG.FLAG_H+CFG.TOKEN_H)*0.55; }
    else { o.token.material.color.setHex(f.main); o.flag.rotation.z=0; o.flag.position.y=CFG.FLAG_H+CFG.TOKEN_H-CFG.FLAG_TH*0.6;
      const att=s.st==="attack"||s.st==="landing";
      o.token.material.emissiveIntensity = focused?(att?0.38+0.2*Math.sin(Time.now*6):0.26):DIM;
      o.ring.material.opacity = focused?(att?0.5+0.18*Math.sin(Time.now*5):0.4):DIM;
      o.ring.material.color.setHex(s.st==="retreat"?0x888888:f.glow); }
  });
}
export function updateArrows(day){
  arrowObjs.forEach(o=>{ const a=o.a, op=a.kind==="march"?0.6:0.85;
    const vis=day>=a.d-0.6&&day<=a.d+1.1;
    let alpha=vis?(smooth(a.d-0.6,a.d,day)*(1-smooth(a.d+0.6,a.d+1.1,day))):0; alpha*=op;
    o.tube.material.opacity=alpha; o.head.material.opacity=alpha;
    o.tube.visible=o.head.visible=alpha>0.01; o.div.style.opacity=alpha*1.1;
    o.flows.forEach((sp,i)=>{ if(alpha<=0.01){ sp.material.opacity=0; return; }
      const t=((Time.now*0.4+i/3)%1); sp.position.copy(o.curve.getPoint(t));
      sp.material.opacity=alpha*(0.6+0.4*Math.sin(t*Math.PI)); }); });
}
export function updateFlags(){ for(const flag of flagWaves){ const pos=flag.geometry.attributes.position, base=flag.userData.base, ph=flag.userData.phase;
  for(let i=0;i<pos.count;i++){ const bx=base[i*3], by=base[i*3+1], k=bx/CFG.FLAG_W;
    pos.setZ(i, Math.sin(bx*0.25+Time.now*5+ph)*CFG.FLAG_TH*0.12*k + Math.sin(by*0.3+Time.now*3)*CFG.FLAG_TH*0.04*k); }
  pos.needsUpdate=true; } }

/* particle systems + sprite texture, built once at module load (scene exists, core imported above) */
const softTex = makeSoftTex();
const GLOW = makeParticleSystem(1800,true,CFG.GLOW_PSCALE);
const SMOKE = makeParticleSystem(1100,false,CFG.SMOKE_PSCALE);
buildFlashes();
