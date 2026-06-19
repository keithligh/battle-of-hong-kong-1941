/* =====================================================================
 *  director.js — the show: camera framing, lower-third captions, the
 *  Director state machine that plays the storyboard like a TV programme,
 *  the transport HUD, and wireUI() (controls + muted-autoplay music).
 *  Captions/HUD/wireUI are bidirectionally coupled to the Director, so they
 *  live together here — internal cohesion, not a cross-module cycle.
 * ===================================================================== */
import { CFG, D, clamp, lerp, easeIO, deg, REDUCE_MOTION } from "./config.js";
import { camera, controls } from "./core.js";
import { vec } from "./projection.js";
import { Clock, setDay, lookTarget, unitById, setFocus } from "./state.js";
import { sampleTrack } from "./entities.js";

/* ===================== CAMERA & DIRECTOR ========================= */
const TITLE_DUR=4.5;
// closing shot: a slow majestic pull-back/orbit over the whole fallen colony (harbour + island + Kowloon)
const OUTRO_CAM={ lng:114.17, lat:22.28, dist:2600, az:0, el:46, orbit:1.0, tween:3.6 };
const _off=new THREE.Vector3();
function spherical(target,dist,azDeg,elDeg){ const a=azDeg*deg, e=elDeg*deg;
  _off.set(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)).multiplyScalar(dist);
  return target.clone().add(_off); }
function camFromShot(c){ const target=vec(c.lng,c.lat,8); return { target, pos:spherical(target,c.dist*CFG.ZOOM,c.az,c.el) }; }
// aim at the centroid of the shot's focus units so the action is centred & close
function shotTarget(sh){ let x=0,y=0,z=0,n=0;
  (sh.focus||[]).forEach(id=>{ const o=unitById[id]; if(!o) return; const s=sampleTrack(o.u.track,sh.day);
    const v=vec(s.lng,s.lat,0); x+=v.x; y+=v.y; z+=v.z; n++; });
  return n ? new THREE.Vector3(x/n, y/n+8, z/n) : vec(sh.cam.lng,sh.cam.lat,8); }

/* ---- captions (lower-third) ---- */
const $=id=>document.getElementById(id);
function showCap(){ $("caption").classList.add("show"); }
function hideCap(){ $("caption").classList.remove("show"); }
let narrLang="both";              // caption narration language: "both" | "zh" | "en"
let lastNarr={zh:"",en:""};       // remembered so the toggle can re-render the current caption
function setNarr(zh,en){ lastNarr={zh:zh||"",en:en||""};
  $("cap-narr").innerHTML = narrLang==="zh" ? `<span class="nz">${lastNarr.zh}</span>`
    : narrLang==="en" ? `<span class="ne">${lastNarr.en||lastNarr.zh}</span>`
    : `<span class="nz">${lastNarr.zh}</span>`+(lastNarr.en?`<span class="ne">${lastNarr.en}</span>`:""); }
function cycleNarrLang(){ narrLang = narrLang==="both"?"zh":narrLang==="zh"?"en":"both";
  const b=$("lang-btn"); if(b) b.textContent = narrLang==="both"?"中／EN":narrLang==="zh"?"中文":"EN";
  setNarr(lastNarr.zh,lastNarr.en); }
function card(zh,en,narrZh,narrEn){ $("cap-date").textContent=""; $("cap-title").innerHTML=zh+`<span class="en">${en}</span>`;
  setNarr(narrZh,narrEn); $("cap-meta").innerHTML=""; showCap(); }
function sideStrength(sh,side){ let s=0; (sh.focus||[]).forEach(id=>{ const o=unitById[id];
  if(o&&o.u.cf&&o.u.faction===side) s+=sampleTrack(o.u.track,Clock.day).s; }); return s; }
function setCaption(sh){
  $("cap-date").textContent=sh.dateLabel;
  $("cap-title").innerHTML=sh.title_zh+`<span class="en">${sh.title_en}</span>`;
  setNarr(sh.narration_zh,sh.narration_en);
  let meta=(sh.commanders||[]).map(c=>`<span class="cmd">${c.zh}${c.en?(" · "+c.en):""}</span>`).join("");
  const MAXS={jp:16000,uk:8000};
  (sh.side==="both"?["jp","uk"]:[sh.side]).forEach(sd=>{ const v=sideStrength(sh,sd); if(!v) return;
    const pct=clamp(v/MAXS[sd]*100,6,100), nm=sd==="jp"?"日軍":"守軍";
    meta+=`<span class="str ${sd}">${nm} ${v.toLocaleString()}人<span class="bar"><i style="width:${pct}%"></i></span></span>`; });
  $("cap-meta").innerHTML=meta; showCap();
}

/* ---- the Director: plays the storyboard like a TV programme ---- */
export const Director = {
  shots:D.storyboard, i:-1, t:0, mode:"title", playing:true, userFree:false, capShown:false,
  fromPos:new THREE.Vector3(), fromTgt:new THREE.Vector3(), tgt:new THREE.Vector3(), fromDay:8, toDay:8,
  start(){ this.mode="title"; this.t=0; this.playing=true; this.userFree=false; setDay(this.shots[0].day);
    const c=camFromShot({lng:114.16,lat:22.33,dist:2600,az:0,el:52}); camera.position.copy(c.pos); controls.target.copy(c.target);
    lookTarget.copy(controls.target);
    card("香港保衛戰","THE BATTLE OF HONG KONG · 1941","1941年12月8日 — 25日 · 十八日戰事 · 「黑色聖誕」","Dec 8 – 25, 1941 · eighteen days · \"Black Christmas\""); },
  enterShot(i){ this.i=i; this.t=0; this.capShown=false; const sh=this.shots[i];
    this.fromDay=Clock.day; this.toDay=sh.day;   // ease the day across the move → smooth day/night + weather
    setFocus(new Set(sh.focus||[])); this.tgt.copy(shotTarget(sh));
    this.fromPos.copy(camera.position); this.fromTgt.copy(controls.target); hideCap(); },
  pauseForUser(){ if(this.mode==="title"||this.userFree) return; this.userFree=true; $("resume").classList.add("show"); },
  resume(){ if(!this.userFree) return; this.userFree=false; $("resume").classList.remove("show");
    if(this.mode==="play"){ this.fromPos.copy(camera.position); this.fromTgt.copy(controls.target); this.t=0; this.capShown=false; hideCap(); }
    this.playing=true; updatePlayBtn(); },
  togglePlay(){ if(this.mode==="outro"){ this.start(); updatePlayBtn(); return; }
    this.playing=!this.playing; updatePlayBtn(); },
  goToShot(i){ i=clamp(i,0,this.shots.length-1);     // jump to a chapter from the timeline axis
    this.userFree=false; $("resume").classList.remove("show"); this.mode="play"; this.playing=true;
    this.enterShot(i); updatePlayBtn(); },
  update(dt){
    if(this.userFree){ lookTarget.copy(controls.target); return; }   // free-look: OrbitControls owns the camera
    if(!this.playing) return;
    this.t+=dt;
    if(this.mode==="title"){ if(this.t>=TITLE_DUR){ hideCap(); this.enterShot(0); this.mode="play"; } return; }
    if(this.mode==="outro"){ const dist=OUTRO_CAM.dist*CFG.ZOOM;
      if(this.t<OUTRO_CAM.tween){ const e=easeIO(this.t/OUTRO_CAM.tween);
        camera.position.lerpVectors(this.fromPos,spherical(this.tgt,dist,OUTRO_CAM.az,OUTRO_CAM.el),e);
        controls.target.lerpVectors(this.fromTgt,this.tgt,e); }
      else { const ot=this.t-OUTRO_CAM.tween;
        controls.target.copy(this.tgt); camera.position.copy(spherical(this.tgt,dist,OUTRO_CAM.az+OUTRO_CAM.orbit*ot*(REDUCE_MOTION?0:1),OUTRO_CAM.el)); }
      lookTarget.copy(controls.target); updateProgress(); return; }
    const sh=this.shots[this.i], dur=CFG.TWEEN+sh.hold, dist=sh.cam.dist*CFG.ZOOM;
    if(this.t<CFG.TWEEN){ const e=easeIO(this.t/CFG.TWEEN);
      setDay(lerp(this.fromDay,this.toDay,e));   // day/night + weather glide as the camera moves
      camera.position.lerpVectors(this.fromPos,spherical(this.tgt,dist,sh.cam.az,sh.cam.el),e);
      controls.target.lerpVectors(this.fromTgt,this.tgt,e); }
    else { const ot=this.t-CFG.TWEEN; setDay(this.toDay);
      controls.target.copy(this.tgt); camera.position.copy(spherical(this.tgt,dist,sh.cam.az+sh.cam.orbit*ot*(REDUCE_MOTION?0:1),sh.cam.el));
      if(!this.capShown){ setCaption(sh); this.capShown=true; } }
    lookTarget.copy(controls.target);
    if(this.t>=dur){
      if(this.i+1<this.shots.length) this.enterShot(this.i+1);
      else { this.mode="outro"; this.t=0; setFocus(new Set());
        this.fromPos.copy(camera.position); this.fromTgt.copy(controls.target);
        this.tgt.copy(vec(OUTRO_CAM.lng,OUTRO_CAM.lat,8));
        card(D.outro.title_zh,D.outro.title_en,D.outro.narration_zh,D.outro.narration_en); updatePlayBtn(); } }
    updateProgress();
  }
};

/* ===================== MINIMAL UI (no control panel) ============= */
export function updatePlayBtn(){ $("play").textContent = Director.mode==="outro" ? "↻" : (Director.playing?"⏸":"▶"); }
function updateProgress(){ const N=Director.shots.length; let f=0;
  if(Director.mode==="play"){ const sh=Director.shots[Director.i]; f=(Director.i+clamp(Director.t/(CFG.TWEEN+sh.hold),0,1))/N; }
  else if(Director.mode==="outro") f=1;
  $("prog").firstChild.style.width=(f*100)+"%";
  $("scene-label").textContent = Director.mode==="outro" ? "完 · END"
    : (Director.mode==="play" ? `1941.12.${String(Math.min(25,Math.floor(Clock.day))).padStart(2,"0")}` : ""); }
// Returns syncMusic so init() can start the MUTED, in-sync soundtrack timeline once audio is buffered + the
// tour has started (silent; audible only after a deliberate music-button click).
export function wireUI(){
  const n=D.notes;
  $("notes-body").innerHTML=`<p>${n.summary}</p><h5>考據與呈現說明 · Caveats</h5><ul>`+
    n.caveats.map(c=>`<li>${c}</li>`).join("")+`</ul><h5>主要來源 · Sources</h5><p>${n.sources}</p>`;
  const np=$("notes");
  $("notes-btn").onclick=()=>np.classList.toggle("open");
  $("notes-close").onclick=()=>np.classList.remove("open");
  $("lang-btn").onclick=cycleNarrLang;
  // background music ("Victoria Harbour 1941") — muted autoplay (silent, in sync with the tour); a DELIBERATE click is the ONLY thing that produces sound
  const bgm=$("bgm"), musicBtn=$("music-btn"); bgm.volume=0.55; bgm.muted=true;   // muted from the start (HTML `muted` attr + re-asserted here) — silent until the user opts in
  let soundOn=false;   // honest default: the user has NOT opted into sound. Governs ONLY audibility (bgm.muted), never the timeline (play/pause).
  const paintMusic=()=>{ musicBtn.textContent=soundOn?"🔊":"🔇"; musicBtn.classList.toggle("off",!soundOn); };   // icon = the user's sound preference (🔇 on load → never reads "on" over a silent first load)
  // the MUTED timeline follows the tour's play/pause ONLY (decoupled from soundOn), so the soundtrack stays in sync for an eventual unmute.
  // muted autoplay is exempt from the browser gesture gate → this play() resolves on load with NO interaction (and stays silent).
  const syncMusic=()=>{ if(Director.playing){ bgm.play().catch(()=>{}); } else { bgm.pause(); } };
  paintMusic();
  // SOLE path to audible sound: a deliberate click flips mute on the already-playing muted element, inside the user gesture (browser-honored).
  // never resets currentTime, so toggling sound never restarts the track; syncMusic() respects a paused tour (sound waits for resume).
  musicBtn.onclick=()=>{ soundOn=!soundOn; bgm.muted=!soundOn; syncMusic(); paintMusic(); };
  $("play").onclick=()=>{ Director.togglePlay(); syncMusic(); };   // pause/resume the tour → pause/resume the (muted) timeline
  $("resume").onclick=()=>{ Director.resume(); syncMusic(); };
  const beats=$("prog-beats"), N=D.storyboard.length;
  D.storyboard.forEach((sh,i)=>{ const b=document.createElement("b"); b.style.left=((i+0.5)/N*100)+"%";
    b.title=sh.dateLabel+" · "+sh.title_zh; beats.appendChild(b); });   // hover a tick to read the chapter
  $("prog").addEventListener("click",e=>{ const r=$("prog").getBoundingClientRect();   // click the time axis to jump to a chapter
    const frac=clamp((e.clientX-r.left)/r.width,0,1); Director.goToShot(Math.round(frac*N-0.5)); });
  controls.addEventListener("start",()=>Director.pauseForUser());   // a user drag pauses the tour
  // auto-hide transport + hint on inactivity
  let idle; const ui=[$("controls"),$("hint")];
  const wake=()=>{ ui.forEach(e=>e.classList.remove("hide")); clearTimeout(idle);
    idle=setTimeout(()=>ui.forEach(e=>e.classList.add("hide")),3500); };
  ["pointermove","pointerdown","keydown","wheel"].forEach(ev=>addEventListener(ev,wake)); wake();
  return syncMusic;
}
