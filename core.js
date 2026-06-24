/* =====================================================================
 *  core.js: the scene-graph singletons (created once, never reassigned)
 *  Renderer, camera, controls, lights, sky, and the resize handler. Every
 *  module that draws into the world imports these. Imports config only.
 * ===================================================================== */
import { CFG } from "./config.js";

/* ========================= BOOTSTRAP =============================== */
export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9fb3c4, 0.00018);

export const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 10, 16000);   // near=10 (not 1): a tiny near plane wrecks z-precision at distance → the translucent sea's depth-test twinkles under the wide-shot orbit

export const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance", preserveDrawingBuffer:false, failIfMajorPerformanceCaveat:false});
renderer.setPixelRatio(Math.min(devicePixelRatio*CFG.SSAA, 2));   // supersample (capped at 2 → no retina regression)
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // static self-shadowing → terrain relief form
document.getElementById("scene").appendChild(renderer.domElement);

export const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.position="absolute";
labelRenderer.domElement.style.top="0";
labelRenderer.domElement.style.pointerEvents="none";
document.getElementById("labels").appendChild(labelRenderer.domElement);

export const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=0.08;
controls.minDistance=90; controls.maxDistance=6500;
controls.maxPolarAngle=Math.PI*0.495;

// Free the GL context on unload so a reload does not LEAK it (browsers reclaim lazily; without this, iterative
// reloading exhausts the WebGL context cap → "Error creating WebGL context", worst on integrated GPUs).
let _glReleased=false;
function releaseGL(){ if(_glReleased)return; _glReleased=true;
  try{ controls.dispose(); }catch(e){} try{ renderer.forceContextLoss(); }catch(e){} try{ renderer.dispose(); }catch(e){} }
addEventListener("pagehide", releaseGL); addEventListener("beforeunload", releaseGL);

export const sun = new THREE.DirectionalLight(0xfff1d6, 1.1);
sun.position.set(900, 1500, 700); scene.add(sun);
export const hemi = new THREE.HemisphereLight(0xbfd4ea, 0x35422f, 0.55); scene.add(hemi);
export const amb = new THREE.AmbientLight(0x404a55, 0.5); scene.add(amb);

addEventListener("resize", ()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  labelRenderer.setSize(innerWidth,innerHeight);
});

/* ---- gradient sky dome (recoloured per weather by applyWeather) ---- */
export const skyMat = new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false,
  uniforms:{ top:{value:new THREE.Color(0x6f9fd0)}, bot:{value:new THREE.Color(0xcad9e2)} },
  vertexShader:`varying float vH; void main(){ vH=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform vec3 top; uniform vec3 bot; varying float vH;
    void main(){ float t=clamp(vH*0.5+0.5,0.0,1.0); gl_FragColor=vec4(mix(bot,top,t),1.0);}`
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(9000,32,16), skyMat));
