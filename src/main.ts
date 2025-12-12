import "./style.css";

import "./components/sidebar";
import "./components/scene";
import { createObject } from "./components/scene";

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

  // --- Optional: Add Transform Control switching here (like Blender's G, R, S) ---
  // if (key.toLowerCase() === 'g') { transformControls.setMode('translate'); }
  // if (key.toLowerCase() === 'r') { transformControls.setMode('rotate'); }
  // if (key.toLowerCase() === 's') { transformControls.setMode('scale'); }
};

const initEventListeners = () => {
  window.addEventListener("keydown", handleKeydown);
};

const initUiListeners = () => {
  const buttons = document.querySelectorAll(".add-object-btn");

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
};

initEventListeners();
document.addEventListener("DOMContentLoaded", () => {
  initUiListeners();
});
