/* =====================================================================
 *  config.js: Battle of Hong Kong 1941 · tunables, data handle, utilities
 *  The loud-failure guard (No Fallback), the CFG/FAC constants, small math,
 *  and the boot helpers. Imported by every other module; imports nothing.
 * ===================================================================== */

/* ---- fail loudly, never silently (Philosophy: No Fallback) -------- *
 *  First error wins (shown-once) so the root cause is what the user sees,
 *  not a cascade of follow-on failures.                                 */
let shown = false;
export function fatal(e){
  if(shown) return; shown=true;
  const el=document.getElementById("err");
  el.style.display="block";
  el.textContent="⚠ 初始化失敗 / Initialization error:\n\n"+(e&&e.stack?e.stack:e)+
    "\n\n（本作需透過 http(s) 伺服器開啟；直接以 file:// 開啟會因瀏覽器安全限制無法讀取地形瓦片。"+
    "本機檢視可執行 `node tools/serve.js` 或使用內建預覽。）";
  const boot=document.getElementById("boot"); if(boot) boot.classList.add("gone");
  console.error(e);
}
window.addEventListener("error", ev=>fatal(ev.error||ev.message));

/* ---- dependency guard: a missing vendored lib must fail loud here, *
 *  before any module touches THREE / BATTLE_DATA (Error Transparency). */
try {
  if(typeof THREE==="undefined") throw new Error("THREE 未載入 (lib/three.min.js)");
  if(!THREE.OrbitControls) throw new Error("OrbitControls 未載入");
  if(!THREE.CSS2DRenderer) throw new Error("CSS2DRenderer 未載入");
  if(!window.BATTLE_DATA) throw new Error("BATTLE_DATA 未載入 (data.js)");
}catch(e){ fatal(e); throw e; }   // throw aborts module loading so the broken engine never half-renders

export const D = window.BATTLE_DATA;
export const bootMsg = t => { const m=document.getElementById("boot-msg"); if(m) m.textContent=t; };

/* ========================= CONFIG ================================== */
export const CFG = {
  GEO:{ minLng:113.88, maxLng:114.32, minLat:22.16, maxLat:22.57, Z:13 }, // == tools/fetch_tiles.ps1
  TARGET_UNITS: 2000,   // world width of the map (height derived → to scale)
  VEXAG: 2.0,           // vertical exaggeration (Y only; XZ stays true to scale)
  TERR_SEG: 420,        // terrain mesh resolution
  SSAA: 1.0,            // supersample factor (1.0 keeps the framebuffer light enough for integrated GPUs; antialias MSAA still smooths edges)
  MAX_IMAGERY_TEX: 4096,// cap the composited imagery texture's long side (integrated-GPU memory safety). HK native is 2816px so this is inert here; present for consistency.
  // archival film grade on the (present-day) satellite imagery; ages modern colour cues toward
  // period footage so the anachronism is disguised. Noise floor: saturation ≥0.55, vignette ≤0.5
  // so the battle area (image centre) stays legible.
  GRADE:{ filter:"sepia(0.32) saturate(0.6) contrast(1.05) brightness(0.97)", vignette:0.42, grain:0.045 },
  DAY_MIN: 8, DAY_MAX: 25.5,
  TWEEN: 2.4,            // camera move duration between shots (s)
  ZOOM: 0.45,           // multiplies each shot's camera distance → tighter framing on the action
  FOCUS:{ UNIT_DIM:0.12, PLACE_NEAR:300, PLACE_FAR:950, MAX_PLACES:6 }, // show only the nearest few place names
  FLASH_K: 0.26,        // muzzle/explosion flash-light dampening (was blowing out the scene)
  // entity scale (tuned to the ~2000-unit metric extent)
  FLAG_H: 30, FLAG_W: 26, FLAG_TH: 16,   // shorter staff + smaller cloth → less "stadium banner / km-pole" clash
  RING_IN: 5, RING_OUT: 8, TOKEN_R: 6.5, TOKEN_H: 7, POLE_R: 0.6, FINIAL_R: 1.2,   // TOKEN_R kept → wedge footprint unchanged
  LBL_REGION: 80, LBL_PEAK: 44, LBL_TOWN: 34, LBL_FORT: 38, LBL_UNIT: 34,
  EU: 5.0,              // effect spatial unit
  GLOW_PSCALE: 400,     // bright additive points (smaller → less glare)
  SMOKE_PSCALE: 340,    // smoke kept modest so it reads as a column, not a dark canopy
};
export const FAC = {
  jp:{ main:0xe23b3b, glow:0xff6a5a, dim:0x7a1f1f, css:"#e23b3b" },
  uk:{ main:0x3b7be2, glow:0x5aa0ff, dim:0x1f3f7a, css:"#3b7be2" },
};
export const REDUCE_MOTION = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);  // honour the OS "reduce motion" preference → drop the cinematic auto-orbit

/* ---- small math --------------------------------------------------- */
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(e0,e1,x)=>{ const t=clamp((x-e0)/(e1-e0||1e-6),0,1); return t*t*(3-2*t); };
export const easeIO=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const deg=Math.PI/180;
