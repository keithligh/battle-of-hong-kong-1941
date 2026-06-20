/* =====================================================================
 *  state.js: cross-cutting runtime state (the cycle-breaking leaf)
 *  The handful of values that several modules both write and read. Holding
 *  them here (object properties + one live-binding setter) lets the per-frame
 *  loop, the Director, and the entity updaters share state WITHOUT importing
 *  one another, so the module graph stays acyclic. Imports only config.
 * ===================================================================== */
import { CFG, clamp } from "./config.js";

export const Clock = { day: CFG.DAY_MIN };          // the simulated day (8 → 25.5 Dec)
export function setDay(d){ Clock.day = clamp(d, CFG.DAY_MIN, CFG.DAY_MAX); }

export const Time = { now: 0 };                     // monotonic seconds since start (drives flag wave / pulse / arrow flow)
export const lookTarget = new THREE.Vector3();      // where the camera looks (drives place-label focus)
export const unitById = {};                         // id → unit render-object (filled at init)

export let focusSet = new Set();                    // unit ids emphasised by the current shot
export function setFocus(s){ focusSet = s; }        // reassigned here so importers see the new Set via the live binding
