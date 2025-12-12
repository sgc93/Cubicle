import "./style.css";

import {
  clearScene,
  createObject,
  deleteSelectedObject,
  sceneObjects,
  selectMode,
  updateSceneObjects
} from "./components/scene";
import type { SceneData } from "./types/SceneTypes";
import { downloadScene, openSceneFile } from "./utils/helpers";
import { addNotification } from "./components/notification";

const objectListBox = document.getElementById(
  "object-list-box"
) as HTMLDivElement;
const objectListBtn = document.getElementById(
  "object-list-btn"
) as HTMLButtonElement;

// --- EVENT LISTENERS ---
let isObjectListBoxOpen = false;
let isShiftAPressed = false;

const toggleObjectList = () => {
  if (isObjectListBoxOpen) {
    isObjectListBoxOpen = false;
    objectListBox.classList.remove("flex");
    objectListBox.classList.add("hidden");
    objectListBtn.classList.remove("bg-accent-1");
    objectListBtn.classList.add("bg-n-300/70");
  } else {
    isObjectListBoxOpen = true;
    objectListBox.classList.remove("hidden");
    objectListBox.classList.add("flex");
    objectListBtn.classList.remove("bg-n-300/70");
    objectListBtn.classList.add("bg-accent-1");
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  const { key, shiftKey } = event;

  if (shiftKey && (key === "a" || key === "A")) {
    event.preventDefault();
    isShiftAPressed = true;
    return;
  } else if (key.toLowerCase() === "a") {
    toggleObjectList();
  } else if (isObjectListBoxOpen && key === "Escape") {
    toggleObjectList();
  } else if (["g", "r", "s"].includes(key.toLowerCase())) {
    switch (key.toLowerCase()) {
      case "g":
        selectMode("translate");
        break;
      case "r":
        selectMode("rotate");
        break;
      case "s":
        selectMode("scale");
        break;
    }
  } else if (key === "Backspace") {
    deleteSelectedObject();
  }

  if (isShiftAPressed) {
    let objectType: string | null = null;

    switch (key.toLowerCase()) {
      case "c":
        objectType = "box";
        break;
      case "p":
        objectType = "plane";
        break;
      case "s":
        objectType = "sphere";
        break;
      case "y":
        objectType = "cylinder";
        break;
      case "o":
        objectType = "cone";
        break;
      case "t":
        objectType = "torus";
        break;
      case "e":
        objectType = "text";
        break;
      default:
        toggleObjectList();
        break;
    }

    isShiftAPressed = false;

    if (objectType) {
      event.preventDefault();
      if (isObjectListBoxOpen) {
        toggleObjectList();
      }
      createObject(objectType as any);
    }
  }
};

const initEventListeners = () => {
  window.addEventListener("keydown", handleKeydown);
};

export const exportSceneToJson = (): string => {
  const exportedObjects = sceneObjects.map((obj) => {
    const mesh = obj.mesh;

    return {
      id: obj.id,
      type: obj.type,
      name: obj.name,
      mode: obj.mode,

      position: {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z
      },
      rotation: {
        x: mesh.rotation.x,
        y: mesh.rotation.y,
        z: mesh.rotation.z
      },
      scale: {
        x: mesh.scale.x,
        y: mesh.scale.y,
        z: mesh.scale.z
      }
    };
  });

  const sceneData = {
    objects: exportedObjects
    // TODO add camera position, background color, etc.
  };

  return JSON.stringify(sceneData, null, 2);
};

export const importSceneFromJson = (jsonString: string) => {
  try {
    const sceneData: SceneData = JSON.parse(jsonString);
    clearScene();
    updateSceneObjects(sceneData.objects);
  } catch (error) {
    addNotification("Unable to load imported JSON, try again!");
  }
};

const initUiListeners = () => {
  const buttons = document.querySelectorAll(".add-object-btn");
  const modeBtns = document.querySelectorAll(".change-mode-btn");
  const jsonBtns = document.querySelectorAll(".json-btn");

  objectListBtn.addEventListener("click", () => toggleObjectList());

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget as HTMLButtonElement;
      const type = targetButton.dataset.type;

      if (type) {
        createObject(type as any);
        toggleObjectList();
      }
    });
  });

  modeBtns.forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget as HTMLButtonElement;
      const type = targetButton.dataset.type;

      if (type) {
        selectMode(type as any);
      }
    });
  });

  jsonBtns.forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget as HTMLButtonElement;
      const type = targetButton.dataset.type;

      if (type) {
        if (type === "export") {
          downloadScene();
        } else {
          openSceneFile();
        }
      }
    });
  });
};

initEventListeners();
document.addEventListener("DOMContentLoaded", () => {
  initUiListeners();
});
