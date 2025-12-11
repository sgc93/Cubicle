import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- DOM ---
const canvas = document.getElementById("viewport-canvas") as HTMLCanvasElement;
if (!canvas) {
  console.error("Canas element not loaded!");
}

// --- CORE GLOBALS ---

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let transformControls: TransformControls;
let mesh: THREE.Mesh | null = null;

// --- SIZES ---
const INIFINITE_GRID_SIZE = 2000;
const CAMERA_FAR_PLANE = INIFINITE_GRID_SIZE + 5000;
const initScene = () => {
  // --- SCENE | CAMERA | RENDERE---
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#424342");
  camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    CAMERA_FAR_PLANE
  );
  camera.position.set(5, 5, 5);

  // --- RENDERER ---
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // --- CONTROLS ---
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // --- HELPERS: GRID, AXES ---
  const grid = new THREE.GridHelper(
    INIFINITE_GRID_SIZE,
    1000,
    "#6d6d6d",
    "#4d4d4d"
  );
  const axes = new THREE.AxesHelper(3);
  axes.setColors("#facc15", "#0466c8", "#25a244");
  scene.add(grid, axes);

  // --- LIGHT ---
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
  const directionalLinght = new THREE.DirectionalLight("#fff", 1.2);
  scene.add(ambientLight, directionalLinght);

  // --- TRANSFORM CONTROLS (Object Manipulation) ---
  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;

    // FIXME update sidebar when drag ends
  });
  transformControls.addEventListener("change", () => {
    if (transformControls.dragging) {
      // FIXME update without refreshing all dimensions
    }
  });
  scene.add(transformControls as unknown as THREE.Object3D);

  // --- RESIZE HANDLER ---
  window.addEventListener("resize", () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate();
};

const animate = () => {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
};

const addNewObject = () => {
  // Detach and remove old mesh/controls if they exist
  if (mesh) {
    transformControls.detach();
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }

  // Create the new default cube
  const geometry = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: "#6b6c6e ",
    roughness: 0.4,
    metalness: 0.1
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 1, 0);
  scene.add(mesh);

  // Attach controls to the new mesh
  transformControls.attach(mesh);
};

if (canvas) {
  initScene();
  addNewObject();
}
