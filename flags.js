/* =====================================================================
 *  flags.js: the per-unit flag texture. Each unit flies the real
 *  national / service flag its force used in DECEMBER 1941 (not the
 *  modern flag; see the anachronism rules below). Pure canvas art; no
 *  external assets. Exports flagTexture(unit) → THREE.CanvasTexture.
 *
 *  Two reusable painters do the heavy lifting:
 *    pUnionFlag: the 1801 Union Flag, drawn once (the offset, counter-
 *                  changed saltire is the one fiddly bit), reused as the
 *                  canton of the White Ensign / Canadian + Indian Red
 *                  Ensigns / Hong Kong Blue Ensign.
 *    pRisingSun16: the true 16-ray Rising Sun; the disc centre is a
 *                  parameter, so it serves the IJA Army War Flag (centred)
 *                  and the IJN Naval Ensign (offset toward the hoist).
 *
 *  Anachronism rules (verified, non-negotiable): 16 rays only (8 = 1954);
 *  Canada's maple leaves are GREEN (red = 1957); India is the Star of
 *  India Red Ensign (the tricolour is 1947); HK is the 1876 colonial
 *  Blue Ensign (the Bauhinia is 1997). Detailed emblems (Canada's full
 *  shield, the Star of India sunburst, the HK harbour badge) are reduced
 *  to a legible identifying cue with the correct tinctures, a reduction
 *  of a real sourced flag, NOT a new invention.
 * ===================================================================== */

const W = 230, H = 150;
const UK_BLUE = "#012169", UK_RED = "#C8102E", JP_RED = "#BC002D",
      WHITE = "#ffffff", LEAF_GREEN = "#2e7d32", GOLD = "#d8b24a";

/* ---- the 1801 Union Flag, drawn into the rect [X,Y,W,H] -------------- *
 *  Written correctly ONCE and reused as a full flag and as the canton of
 *  every British-system ensign below. The St Patrick (red) saltire is
 *  counterchanged with the St Andrew (white) saltire: red lowermost in the
 *  upper-hoist & lower-fly arms, uppermost in the lower-hoist & upper-fly. */
function pUnionFlag(c, X, Y, w, h){
  c.save();
  c.beginPath(); c.rect(X, Y, w, h); c.clip();
  c.fillStyle = UK_BLUE; c.fillRect(X, Y, w, h);
  const cx = X + w/2, cy = Y + h/2;
  // St Andrew: broad white diagonals
  c.lineCap = "butt"; c.strokeStyle = WHITE; c.lineWidth = h*0.30;
  c.beginPath(); c.moveTo(X, Y); c.lineTo(X+w, Y+h); c.moveTo(X+w, Y); c.lineTo(X, Y+h); c.stroke();
  // St Patrick: counterchanged red, each arm offset to one side of the white
  const off = h*0.10;
  c.strokeStyle = UK_RED; c.lineWidth = h*0.10;
  const corners = [[X,Y,0],[X+w,Y,1],[X+w,Y+h,2],[X,Y+h,3]]; // TL, TR, BR, BL
  for(const [bx, by, i] of corners){
    const dx = bx-cx, dy = by-cy, L = Math.hypot(dx,dy), px = -dy/L, py = dx/L;
    const wantDown = (i===0 || i===2);                 // red lowermost on TL & BR arms
    const s = wantDown ? (py>0?1:-1) : (py>0?-1:1);
    const ox = px*off*s, oy = py*off*s;
    c.beginPath(); c.moveTo(cx+ox, cy+oy); c.lineTo(bx+ox, by+oy); c.stroke();
  }
  // St George: white fimbriation then the red cross
  const wW = h*0.30, rW = h*0.18;
  c.fillStyle = WHITE; c.fillRect(cx-wW/2, Y, wW, h); c.fillRect(X, cy-wW/2, w, wW);
  c.fillStyle = UK_RED; c.fillRect(cx-rW/2, Y, rW, h); c.fillRect(X, cy-rW/2, w, rW);
  c.restore();
}

/* ---- the 16-ray Rising Sun; disc centre X = X + w*oxFrac ------------- */
function pRisingSun16(c, X, Y, w, h, oxFrac){
  c.save();
  c.beginPath(); c.rect(X, Y, w, h); c.clip();
  c.fillStyle = WHITE; c.fillRect(X, Y, w, h);
  const ox = X + w*oxFrac, oy = Y + h/2, reach = Math.hypot(w, h)*1.1;
  c.fillStyle = JP_RED;
  for(let k=0;k<16;k++){                                // 16 red rays, 11.25° wide, 11.25° apart
    const a0 = k*Math.PI/8, a1 = a0 + Math.PI/16;
    c.beginPath(); c.moveTo(ox, oy);
    c.lineTo(ox+Math.cos(a0)*reach, oy+Math.sin(a0)*reach);
    c.lineTo(ox+Math.cos(a1)*reach, oy+Math.sin(a1)*reach);
    c.closePath(); c.fill();
  }
  c.beginPath(); c.arc(ox, oy, h*0.30, 0, 7); c.fill();
  c.restore();
}

/* ---- small flag-emblem helpers (maple leaf · star · junk + hill) ----- */
function mapleLeaf(c, x, y, r, col){ c.fillStyle = col; c.beginPath();
  const pts=[[0,-1],[.18,-.5],[.55,-.62],[.42,-.22],[.92,-.18],[.55,.05],[.78,.42],
    [.3,.32],[.34,.86],[0,.55],[-.34,.86],[-.3,.32],[-.78,.42],[-.55,.05],[-.92,-.18],
    [-.42,-.22],[-.55,-.62],[-.18,-.5]];
  pts.forEach((p,i)=>{ const Px=x+p[0]*r, Py=y+p[1]*r; i?c.lineTo(Px,Py):c.moveTo(Px,Py); }); c.closePath(); c.fill(); }
function starN(c, x, y, r, n, col){ c.fillStyle = col; c.beginPath();
  for(let i=0;i<n*2;i++){ const a=Math.PI/n*i-Math.PI/2, rr=i%2?r*0.42:r;
    const Px=x+Math.cos(a)*rr, Py=y+Math.sin(a)*rr; i?c.lineTo(Px,Py):c.moveTo(Px,Py); } c.closePath(); c.fill(); }
function junkHill(c, x, y, r){   // stylised junk + hill silhouette for the HK colonial badge
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  c.fillStyle = "#9fb8c8"; c.beginPath(); c.moveTo(x-r, y+r*0.25);   // hills
  c.quadraticCurveTo(x-r*0.3, y-r*0.55, x+r*0.2, y+r*0.05);
  c.quadraticCurveTo(x+r*0.6, y-r*0.35, x+r, y+r*0.2); c.lineTo(x+r, y+r); c.lineTo(x-r, y+r); c.closePath(); c.fill();
  c.fillStyle = "#cfe0ea"; c.fillRect(x-r, y+r*0.38, r*2, r*0.62);   // water
  c.fillStyle = "#7a5a3a"; c.beginPath();                            // sail
  c.moveTo(x-r*0.04, y+r*0.40); c.lineTo(x-r*0.04, y-r*0.42); c.quadraticCurveTo(x-r*0.5, y-r*0.15, x-r*0.42, y+r*0.30); c.closePath(); c.fill();
  c.fillStyle = "#3a2f25"; c.beginPath();                            // hull
  c.moveTo(x-r*0.5, y+r*0.46); c.lineTo(x+r*0.5, y+r*0.46); c.lineTo(x+r*0.32, y+r*0.64); c.lineTo(x-r*0.32, y+r*0.64); c.closePath(); c.fill();
  c.restore();
}

/* ---- the seven flags (canvas is W×H; field drawn first, then canton, then fly badge) ---- */
function canton(c){ pUnionFlag(c, 0, 0, W*0.5, H*0.5); }   // top-left quarter
const flags = {
  // Imperial Japan: Rising Sun war flags (16-ray). IJA disc centred; IJN disc offset to the hoist (7/18).
  ija:      (c)=> pRisingSun16(c, 0, 0, W, H, 0.5),
  ijn:      (c)=> pRisingSun16(c, 0, 0, W, H, 7/18),
  hinomaru: (c)=>{ c.fillStyle=WHITE; c.fillRect(0,0,W,H); c.fillStyle=JP_RED; c.beginPath(); c.arc(W*0.5,H*0.5,H*0.30,0,7); c.fill(); },
  // United Kingdom: the Union Flag
  union:    (c)=> pUnionFlag(c, 0, 0, W, H),
  // Royal Navy: White Ensign (red St George cross + Union canton)
  rn: (c)=>{ c.fillStyle=WHITE; c.fillRect(0,0,W,H);
    const rW=H*0.16; c.fillStyle=UK_RED; c.fillRect(W/2-rW/2,0,rW,H); c.fillRect(0,H/2-rW/2,W,rW); canton(c); },
  // Canada: 1922–57 Red Ensign (red field, Union canton, GREEN maple leaves on a white roundel)
  canada: (c)=>{ c.fillStyle=UK_RED; c.fillRect(0,0,W,H); canton(c);
    const dx=W*0.74, dy=H*0.5, dr=H*0.30;
    c.fillStyle=WHITE; c.beginPath(); c.arc(dx,dy,dr,0,7); c.fill();
    mapleLeaf(c, dx,         dy+dr*0.16, dr*0.46, LEAF_GREEN);   // sprig of three (period-correct = GREEN)
    mapleLeaf(c, dx-dr*0.52, dy+dr*0.24, dr*0.36, LEAF_GREEN);
    mapleLeaf(c, dx+dr*0.52, dy+dr*0.24, dr*0.36, LEAF_GREEN); },
  // British India: Star of India Red Ensign (red field, Union canton, gold star roundel; NO motto lettering)
  india: (c)=>{ c.fillStyle=UK_RED; c.fillRect(0,0,W,H); canton(c);
    const dx=W*0.74, dy=H*0.5, dr=H*0.30;
    c.fillStyle="#0b2a5b"; c.beginPath(); c.arc(dx,dy,dr*0.96,0,7); c.fill();   // dark garter ring
    c.fillStyle="#f2ead2"; c.beginPath(); c.arc(dx,dy,dr*0.66,0,7); c.fill();
    starN(c, dx, dy, dr*0.62, 5, GOLD); },
  // Hong Kong: 1876 colonial Blue Ensign (blue field, Union canton, "local scene" badge → junk + hills)
  hk: (c)=>{ c.fillStyle=UK_BLUE; c.fillRect(0,0,W,H); canton(c);
    const dx=W*0.74, dy=H*0.5, dr=H*0.31;
    c.fillStyle="#eef3f6"; c.beginPath(); c.arc(dx,dy,dr,0,7); c.fill();
    junkHill(c, dx, dy, dr); },
};

const flagTexCache = {};
export function flagTexture(unit){
  if(flagTexCache[unit.id]) return flagTexCache[unit.id];
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const draw = flags[unit.flag];
  if(!draw) console.warn(`unknown flag "${unit.flag}" for ${unit.id}; falling back by faction`);
  (draw || (unit.faction === "jp" ? flags.ija : flags.union))(c);
  // subtle cloth shadow at the hoist (pole) edge; depth cue, kept clear of the canton emblems
  const sh = c.createLinearGradient(0, 0, W*0.18, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.26)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh; c.fillRect(0, 0, W*0.18, H);
  // thin neutral edge so the flag reads against the terrain
  c.strokeStyle = "rgba(0,0,0,0.45)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, W-3, H-3);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  flagTexCache[unit.id] = tex; return tex;
}
