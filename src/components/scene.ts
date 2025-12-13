import * as THREE from "three";
import { displayOpenObjects, displaySelectedOjbect } from "./sidebar";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import type {
  ExportedObject,
  ObjectModeType,
  ObjectType,
  SceneObject
} from "../types/SceneTypes";
import { addNotification } from "./notification";

// --- DOM ---
const viewport = document.getElementById("viewport") as HTMLDivElement;
if (!viewport) {
  addNotification("Viewport element not found, refresh page!");
}

// --- CORE GLOBALS ---
let scene: THREE.Scene;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let transformControls: TransformControls;
let boundingBoxHelper: THREE.BoxHelper | null = null;

// --- OBJECTS ---
export let sceneObjects: SceneObject[] = [];
export let selectedObject: SceneObject | null = null;

let typeCounter: { [key: string]: number } = {};

// --- SIZES ---
const INFINITE_GRID_SIZE = 2000;
const CAMERA_FAR_PLANE = INFINITE_GRID_SIZE + 5000;

export const updateBoundingBoxHelper = () => boundingBoxHelper?.update();

const initScene = () => {
  // --- SCENE | CAMERA | RENDERE---
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#424342");
  camera = new THREE.PerspectiveCamera(
    75,
    viewport.clientWidth / viewport.clientHeight,
    0.1,
    CAMERA_FAR_PLANE
  );
  camera.position.set(5, 5, 5);

  // --- RENDERER ---

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  viewport.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.domElement.addEventListener("pointerdown", onPointerClick, false);

  // --- CONTROLS ---

  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;

  // --- HELPERS: GRID, AXES ---

  const grid = new THREE.GridHelper(
    INFINITE_GRID_SIZE,
    1000,
    "#6d6d6d",
    "#4d4d4d"
  );
  scene.add(grid);

  const axes = new THREE.AxesHelper(3);
  axes.setColors("#facc15", "#0466c8", "#25a244");
  scene.add(axes);
  // --- LIGHT ---

  const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
  const directionalLinght = new THREE.DirectionalLight("#fff", 1.2);
  directionalLinght.position.set(10, 10, 5);
  directionalLinght.castShadow = true;
  scene.add(ambientLight, directionalLinght);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // --- TRANSFORM CONTROLS (Object Manipulation) ---
  transformControls = new TransformControls(camera, renderer.domElement); // FIXME Added event listener to update selection helpers on transform change
  const helpers = transformControls.getHelper();
  scene.add(helpers);
  transformControls.addEventListener("change", () => {
    if (selectedObject) {
      if (boundingBoxHelper) boundingBoxHelper.update();
      displaySelectedOjbect(selectedObject);
    }
    renderer.render(scene, camera);
  });

  transformControls.addEventListener("objectChange", () => {
    if (selectedObject) {
      if (boundingBoxHelper) boundingBoxHelper.update();
      displaySelectedOjbect(selectedObject);
    }
  });
  transformControls.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
  });

  scene.add(transformControls as unknown as THREE.Object3D);

  renderer.render(scene, camera);

  // --- RESIZE HANDLER ---

  window.addEventListener("resize", () => {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;

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

export const updateSceneObjects = (objects: ExportedObject[]) => {
  objects.forEach((obj, index) => {
    let geometry: THREE.BufferGeometry;
    let newMesh: THREE.Mesh;

    switch (obj.type) {
      case "box":
      case "mesh":
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case "plane":
        geometry = new THREE.PlaneGeometry(10, 10);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(1.5, 32, 16);
        break;
      case "cylinder":
        geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(1.5, 3, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
        break;
      case "text": // FIXEME handle displaying text
        geometry = new THREE.BoxGeometry(2, 2, 0.2);
        break;
      default:
        return;
    }

    const material = createDefaultMaterial();
    newMesh = new THREE.Mesh(geometry, material);

    newMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
    newMesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    newMesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

    newMesh.castShadow = true;
    newMesh.receiveShadow = true;
    newMesh.name = obj.name;

    scene.add(newMesh);

    const newSceneObj: SceneObject = {
      id: obj.id,
      type: obj.type,
      name: obj.name,
      mesh: newMesh,
      mode: "translate"
    };

    sceneObjects.push(newSceneObj);
    if (index === objects.length) {
      selectedObject = newSceneObj;
      selectObject(newSceneObj.id);
    }
  });
};
export const clearScene = () => {
  for (const obj of sceneObjects) {
    scene.remove(obj.mesh);
    obj.mesh.geometry.dispose();
    (obj.mesh.material as THREE.Material).dispose();
  }

  if (boundingBoxHelper) scene.remove(boundingBoxHelper);
  boundingBoxHelper = null;
  transformControls.detach();

  sceneObjects = [];
  selectedObject = null;
  typeCounter = {};

  displaySelectedOjbect(null);
  displayOpenObjects([], null);
};

function onPointerClick(event: PointerEvent) {
  if (transformControls.dragging) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const meshes = sceneObjects.map((obj) => obj.mesh);
  const intersects = raycaster.intersectObjects(meshes, false);

  if (intersects.length > 0) {
    const intersectedMesh = intersects[0].object as THREE.Mesh;
    const sceneObject = sceneObjects.find(
      (obj) => obj.mesh === intersectedMesh
    );

    if (sceneObject) {
      selectObject(sceneObject.id);
      return;
    } else {
      selectObject("lfjdf");
    }
  }

  selectObject("");
}

const updateSelectionHelpers = (object: SceneObject | null) => {
  if (boundingBoxHelper) scene.remove(boundingBoxHelper);
  boundingBoxHelper = null;

  if (object) {
    const mesh = object.mesh;

    boundingBoxHelper = new THREE.BoxHelper(mesh, "#f77f00");
    scene.add(boundingBoxHelper);

    transformControls.attach(object.mesh);
  } else {
    transformControls.detach();
  }
};

export const colorModeBtns = (mode: ObjectModeType) => {
  const changeModeBtns =
    document.querySelectorAll<HTMLButtonElement>(".change-mode-btn");

  changeModeBtns.forEach((button) => {
    const type = button.dataset.type;

    if (type === mode) {
      button.classList.remove("bg-n-300/70", "hover:bg-accent-1");
      button.classList.add("bg-accent-1");
    } else {
      button.classList.remove("bg-accent-1");
      button.classList.add("bg-n-300/70", "hover:bg-accent-1");
    }
  });
};

export const selectMode = (mode: ObjectModeType) => {
  if (selectedObject) {
    transformControls.setMode(mode);
    selectedObject.mode = mode;
    colorModeBtns(mode);
  } else {
    transformControls.detach();
    addNotification("No selected object, Just click on the object!");
  }
};

const findObjectById = (id: string): SceneObject | null => {
  return sceneObjects.find((obj) => obj.id === id) || null;
};

const selectObject = (objectId: string) => {
  const objectToSelect = findObjectById(objectId);

  if (!objectToSelect) {
    if (selectedObject) {
      selectedObject = null;
      updateSelectionHelpers(null);
      displaySelectedOjbect(null);
      displayOpenObjects(sceneObjects, null);
    }
    return;
  }

  if (selectedObject?.id !== objectToSelect.id) {
    selectedObject = objectToSelect;
    updateSelectionHelpers(selectedObject);
  } else {
    updateSelectionHelpers(selectedObject);
  }

  selectMode(selectedObject.mode || "translate");
  displaySelectedOjbect(selectedObject);
  displayOpenObjects(sceneObjects, selectedObject);
};

export const deleteObject = (id: string) => {
  const objeTobeDelteted = findObjectById(id);

  if (objeTobeDelteted) {
    scene.remove(objeTobeDelteted.mesh);

    if (selectedObject?.id === objeTobeDelteted.id) {
      selectedObject.mesh.geometry.dispose();
      (selectedObject.mesh.material as THREE.Material).dispose();
      selectedObject = null;

      if (boundingBoxHelper) {
        scene.remove(boundingBoxHelper);
        boundingBoxHelper = null;
      }

      transformControls.detach();
    }

    const index = sceneObjects.findIndex(
      (obj) => obj.id === objeTobeDelteted.id
    );
    if (index > -1) {
      sceneObjects.splice(index, 1);
    }

    const deletedObjectName = objeTobeDelteted.name;

    displaySelectedOjbect(selectedObject);
    displayOpenObjects(sceneObjects, selectedObject);

    addNotification(`${deletedObjectName} is deleted!`)
  } else {
    console.warn("object not find to delete");
  }
};

export const deleteSelectedObject = () => {
  if (selectedObject) {
    deleteObject(selectedObject.id);
  }
};

const createDefaultMaterial = () => {
  return new THREE.MeshStandardMaterial({
    color: "#6b6c6e",
    roughness: 0.4,
    metalness: 0.1
  });
};


export const duplicateObject = () => {
  if (selectedObject) {
    let newObj: SceneObject;

    let currCount = typeCounter[selectedObject.type] || 0;
    currCount++;
    typeCounter[selectedObject.type] = currCount;

    newObj = {
      type: selectedObject.type,
      name: `${selectedObject.name} - copy`,
      mesh: selectedObject.mesh.clone(),
      id: `obj_${selectedObject.type}_${new Date()}_${currCount}`,
      mode: "translate"
    };

    const originalName = selectedObject.name;

    sceneObjects.push(newObj);
    selectedObject = newObj;

    scene.add(selectedObject.mesh);

    displayOpenObjects(sceneObjects, selectedObject);
    displaySelectedOjbect(selectedObject);
    addNotification(`${originalName} is duplicated!`);
  } else {
    addNotification("Select object to duplicate it!");
  }
};

export const createObject = (type: ObjectType) => {
  let geometry: THREE.BufferGeometry;
  let newMesh: THREE.Mesh;

  switch (type) {
    case "box":
    case "mesh":
      geometry = new THREE.BoxGeometry(2, 2, 2);
      break;
    case "plane":
      geometry = new THREE.PlaneGeometry(10, 10);
      break;
    case "sphere":
      geometry = new THREE.SphereGeometry(1.5, 32, 16);
      break;
    case "cylinder":
      geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
      break;
    case "cone":
      geometry = new THREE.ConeGeometry(1.5, 3, 32);
      break;
    case "torus":
      geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
      break;
    case "text": // FIXEME handle displaying text
      geometry = new THREE.BoxGeometry(2, 2, 0.2);
      break;
    default:
      return;
  }

  const material = createDefaultMaterial();
  newMesh = new THREE.Mesh(geometry, material);

  if (type === "plane") {
    newMesh.rotation.x = -Math.PI / 2;
  }
  if (type === "torus") {
    newMesh.rotation.x = Math.PI / 2;
  }

  let currCount = typeCounter[type] || 0;
  currCount++;
  typeCounter[type] = currCount;

  newMesh.castShadow = true;
  newMesh.receiveShadow = true;
  newMesh.name = `${
    type.charAt(0).toUpperCase() + type.slice(1)
  } (${currCount})`;

  scene.add(newMesh);

  const newSceneObj: SceneObject = {
    id: `obj_${type}_${Date.now()}_${currCount}`,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} (${currCount})`,
    mesh: newMesh,
    mode: "translate"
  };

  sceneObjects.push(newSceneObj);
  selectedObject = newSceneObj;

  selectObject(newSceneObj.id);
};

const initApp = () => {
  initScene();
  createObject("torus");
};

if (viewport) {
  (window as any).duplicateObject = duplicateObject;
  (window as any).handleSelectObject = selectObject;
  (window as any).deleteObject = deleteObject;
  initApp();
}
