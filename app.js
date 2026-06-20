/* =====================================================================
 *  app.js: Battle of Hong Kong 1941 · interactive 3D documentary (entry)
 *  REAL terrain: AWS Terrarium DEM + EOX Sentinel-2 cloudless 2016, Web-Mercator,
 *  to scale. Reads window.BATTLE_DATA (real lng/lat). Three.js r128.
 *
 *  This is the thin entry point: it wires the ES modules together, owns the
 *  per-frame loop, and runs the async init() boot sequence. The engine itself
 *  lives in the modules: config · state · core · projection · flags ·
 *  terrain · entities · director, each a single cohesive concern.
 *  (Loaded as <script type="module">; the vendored THREE libs + data.js are
 *  classic <script>s above it, so global THREE / BATTLE_DATA exist at eval.)
 * ===================================================================== */
import { D, FAC, fatal, bootMsg } from "./config.js";
import { Clock, Time, unitById } from "./state.js";
import { scene, camera, renderer, labelRenderer, controls } from "./core.js";
import { loadTiles, buildTerrain, buildLabels, buildLine, updateLines, updateFront,
         updateLabels, placeLabels, gdlLabel, frontLabel } from "./terrain.js";
import { buildUnit, buildArrow, buildRain, updateUnits, updateArrows, updateFlags,
         updateEffects, applyWeather, stepRain, unitObjs, arrowObjs } from "./entities.js";
import { Director, wireUI, updatePlayBtn } from "./director.js";

/* ===================== ANIMATION LOOP ============================= */
let last=performance.now();
// screen-space label de-collision: after CSS2DRenderer positions the labels,
// push any overlapping ones downward (units have priority, place names yield).
function decollide(){
  const items=[];
  for(const o of unitObjs) if(o.visible && o.lbl.visible && (+o.div.style.opacity||0)>0.05) items.push(o.div);
  for(const o of arrowObjs) if((+o.div.style.opacity||0)>0.05) items.push(o.div);
  if(gdlLabel && gdlLabel.o.visible && (+gdlLabel.div.style.opacity||0)>0.05) items.push(gdlLabel.div);
  if(frontLabel && frontLabel.o.visible) items.push(frontLabel.div);
  for(const l of placeLabels) if(l.div.style.display!=="none" && (+l.div.style.opacity||0)>0.05) items.push(l.div);
  if(items.length<1) return;
  const R=items.map(el=>el.getBoundingClientRect());   // batched reads (one reflow)
  const placed=[];
  // fixed HUD panels are immovable obstacles; a map label must never hide under them
  for(const hudId of ["hud-tl","key"]){ const el=document.getElementById(hudId);
    if(el){ const hb=el.getBoundingClientRect(); if(hb.width>0) placed.push({top:hb.top,bottom:hb.bottom,left:hb.left,right:hb.right}); } }
  for(let i=0;i<items.length;i++){
    const r={top:R[i].top,bottom:R[i].bottom,left:R[i].left,right:R[i].right}; let dy=0, guard=0, moved=true;
    while(moved && guard++<24){ moved=false;
      for(const p of placed){ if(r.left<p.right && r.right>p.left && r.top<p.bottom+3 && r.bottom>p.top){
        const push=p.bottom-r.top+4; dy+=push; r.top+=push; r.bottom+=push; moved=true; } } }
    if(dy) items[i].style.transform+=` translateY(${dy.toFixed(1)}px)`;
    placed.push(r);
  }
}
function renderScene(){ controls.update(); renderer.render(scene,camera); labelRenderer.render(scene,camera); decollide(); }
function frame(dt){
  Director.update(dt);                  // drives camera + clock + captions + focus
  const w=applyWeather(Clock.day);
  updateFront(Clock.day); updateLines(Clock.day); updateUnits(Clock.day); updateArrows(Clock.day);
  updateFlags(); updateEffects(Clock.day,dt); stepRain(dt,w); updateLabels();
  renderScene();
}
function animate(){
  requestAnimationFrame(animate);
  const t=performance.now(); let dt=(t-last)/1000; last=t; if(dt>0.1) dt=0.1; Time.now+=dt;
  frame(dt);
}

/* ===================== ASYNC INIT ================================= */
function awaitAudio(){   // hold boot until the background mp3 is buffered (10s hard cap so audio can never hang the experience)
  const a=document.getElementById("bgm");
  if(!a || a.readyState>=4) return Promise.resolve();
  return new Promise(res=>{ let done=false; const finish=()=>{ if(!done){done=true;res();} };
    a.addEventListener("canplaythrough",finish,{once:true});
    a.addEventListener("error",finish,{once:true});            // failed load → degrade, don't hang
    setTimeout(finish, 10000);
    try{ a.load(); }catch(e){}
  });
}
(async function init(){
  try{
    // FAC is the single source for the faction colours; push them into the CSS custom properties the legend reads.
    { const hx=n=>"#"+n.toString(16).padStart(6,"0"), rs=document.documentElement.style;
      rs.setProperty("--jp",FAC.jp.css);  rs.setProperty("--jp-glow",hx(FAC.jp.glow));
      rs.setProperty("--uk",FAC.uk.css);  rs.setProperty("--uk-glow",hx(FAC.uk.glow)); }
    renderer.domElement.setAttribute("role","img");
    renderer.domElement.setAttribute("aria-label","互動式 3D 地圖：1941 香港保衛戰 · Interactive 3D map of the Battle of Hong Kong, 1941");
    await loadTiles();
    buildTerrain(); buildLabels(); buildLine(); buildRain();
    D.units.forEach(buildUnit); D.arrows.forEach(buildArrow);
    unitObjs.forEach(o=>{ unitById[o.u.id]=o; });
    const kickMusic = wireUI(); applyWeather(D.storyboard[0].day);   // wireUI returns syncMusic → starts the muted, in-sync soundtrack timeline once the tour begins
    bootMsg("載入配樂 · Loading music…"); await awaitAudio();   // mp3 buffered before the tour begins
    Director.start(); updatePlayBtn(); kickMusic();   // start the MUTED, in-sync soundtrack timeline (muted autoplay is gesture-exempt; silent). Audible sound requires a deliberate music-button click.
    bootMsg("啟動…"); renderScene(); animate();
    setTimeout(()=>{ const b=document.getElementById("boot"); if(b) b.classList.add("gone"); }, 600);
  }catch(e){ fatal(e); }
})();
