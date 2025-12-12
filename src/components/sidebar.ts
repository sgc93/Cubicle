import { radToDeg } from "three/src/math/MathUtils.js";
import type { SceneObject } from "../types/SceneTypes";
import { getSvg } from "../utils/getSvg";
import { selectedObject, updateBoundingBoxHelper } from "./scene";
import { degToRad } from "../utils/helpers";

const createListObjectHTML = (object: SceneObject, isSelected: boolean) => {
  const iconSvg = getSvg(object.type, isSelected);

  return `
            <div
                id="list-object-${object.id}"
                class="group flex items-center gap-3 justify-between px-1 py-0.5 transition-all duration-300 ${
                  isSelected ? "bg-n-600" : "hover:bg-n-600"
                } rounded-sm"
              >
                <button 
                    id="list-object-open-${object.id}"
                    data-object-id="${object.id}"
                    class="flex items-center gap-2 cursor-pointer"
                    onclick="window.handleSelectObject('${object.id}')"
                >
                  ${iconSvg}

                  <span
                    class=" text-sm transition-all duration-300 ${
                      isSelected
                        ? "text-accent-1"
                        : "text-n-100 group-hover:text-accent-1"
                    }"
                    >${object.name}</span
                  >
                </button>

                <button
                    id="list-object-delete-${object.id}"
                    data-object-id="${object.id}"
                  class="group cursor-pointer p-0.5 transition-all duration-300 hover:bg-accent-1/10 opacity-0 group-hover:opacity-100"
                  onclick="window.deleteObject('${object.id}')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-3.5 h-3.5 stroke-accent-1 transition-all duration-300"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </div>
        `;
};

export const displayOpenObjects = (
  sceneObjects: SceneObject[],
  selectedObj: SceneObject | null
) => {
  const listBox = document.getElementById(
    "open-objects-list-box"
  ) as HTMLDivElement | null;

  if (!listBox) {
    return;
  }

  listBox.innerHTML = "";
  const parser = new DOMParser();

  if (sceneObjects.length > 0) {
    sceneObjects.forEach((object) => {
      const isSelected = selectedObj ? object.id === selectedObj.id : false;
      const htmlString = createListObjectHTML(object, isSelected);
      const doc = parser.parseFromString(htmlString, "text/html");
      const itemElement = doc.body.firstChild;

      if (itemElement) {
        listBox.appendChild(itemElement);
      }
    });
  } else {
    const doc = parser.parseFromString(
      `<div class="flex flex-col gap-0.5 items-center text-center">
          <span class="text-sm text-n-100">No object is selected!</span>
          <span class="text-xs text-n-300">Use shortcuts or press A to add shapes.</span>
        </div>`,
      "text/html"
    );
    const itemElement = doc.body.firstChild;

    if (itemElement) {
      listBox.appendChild(itemElement);
    }
  }
};

const inputs = {
  translate: { x: "translate-x", y: "translate-y", z: "translate-z" },
  rotate: { x: "rotate-x", y: "rotate-y", z: "rotate-z" },
  scale: { x: "scale-x", y: "scale-y", z: "scale-z" }
};

export const displaySelectedOjbect = (object: SceneObject | null) => {
  const nameBox = document.getElementById(
    "selected-object-name"
  ) as HTMLSpanElement | null;
  const iconBox = document.getElementById(
    "selected-object-svg"
  ) as HTMLDivElement | null;
  const customBoxOverlay = document.getElementById(
    "customize-box-overlay"
  ) as HTMLDivElement | null;

  const parser = new DOMParser();

  if (object) {
    if (customBoxOverlay) {
      customBoxOverlay.classList.add("hidden");
      customBoxOverlay.classList.remove("flex");
    }
    // title
    if (nameBox) {
      nameBox.innerHTML = object?.name ?? "";
    }
    if (iconBox) {
      const doc = parser.parseFromString(
        getSvg(object?.type || "box", false),
        "text/html"
      );
      const itemElement = doc.body.firstChild;

      if (itemElement) {
        iconBox.innerHTML = "";
        iconBox.appendChild(itemElement);
      }
    }

    const mesh = object.mesh;

    (document.getElementById(inputs.translate.x) as HTMLInputElement).value =
      mesh.position.x.toFixed(2);
    (document.getElementById(inputs.translate.y) as HTMLInputElement).value =
      mesh.position.y.toFixed(2);
    (document.getElementById(inputs.translate.z) as HTMLInputElement).value =
      mesh.position.z.toFixed(2);

    (document.getElementById(inputs.rotate.x) as HTMLInputElement).value =
      radToDeg(mesh.rotation.x).toFixed(2);
    (document.getElementById(inputs.rotate.y) as HTMLInputElement).value =
      radToDeg(mesh.rotation.y).toFixed(2);
    (document.getElementById(inputs.rotate.z) as HTMLInputElement).value =
      radToDeg(mesh.rotation.z).toFixed(2);

    (document.getElementById(inputs.scale.x) as HTMLInputElement).value =
      mesh.scale.x.toFixed(2);
    (document.getElementById(inputs.scale.y) as HTMLInputElement).value =
      mesh.scale.y.toFixed(2);
    (document.getElementById(inputs.scale.z) as HTMLInputElement).value =
      mesh.scale.z.toFixed(2);
  } else if (customBoxOverlay) {
    if (nameBox) {
      nameBox.innerHTML = "-- Select Object to edit --";
    }
    if (iconBox) {
      iconBox.innerHTML = "?";
    }

    customBoxOverlay.classList.remove("hidden");
    customBoxOverlay.classList.add("flex");
  }
};

const setupInputListeners = () => {
  if (!document.getElementById(inputs.translate.x)) {
    return;
  }

  const updateMeshProperty = (
    property: "position" | "rotation" | "scale",
    axis: "x" | "y" | "z",
    elementId: string,
    isAngle = false
  ) => {
    const inputElement = document.getElementById(elementId) as HTMLInputElement;

    inputElement.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });

    inputElement?.addEventListener("change", () => {
      if (!selectedObject) return;

      let newValue = parseFloat(inputElement.value);
      if (isNaN(newValue)) return;

      if (isAngle) {
        newValue = degToRad(newValue);
      }

      selectedObject.mesh[property][axis] = newValue;
      updateBoundingBoxHelper();
    });
  };

  updateMeshProperty("position", "x", inputs.translate.x);
  updateMeshProperty("position", "y", inputs.translate.y);
  updateMeshProperty("position", "z", inputs.translate.z);

  updateMeshProperty("rotation", "x", inputs.rotate.x, true);
  updateMeshProperty("rotation", "y", inputs.rotate.y, true);
  updateMeshProperty("rotation", "z", inputs.rotate.z, true);

  updateMeshProperty("scale", "x", inputs.scale.x);
  updateMeshProperty("scale", "y", inputs.scale.y);
  updateMeshProperty("scale", "z", inputs.scale.z);
};

let isSidebarOpen: boolean = window.innerWidth > 768 ? true : false;

const toggleBtnClick = () => {
  const toggleBtn = document.getElementById(
    "toggle-sidebar-btn"
  ) as HTMLButtonElement;
  const sidebar = document.getElementById("sidebar") as HTMLDivElement;
  const sidebarIcon = document.getElementById("sidebar-icon") as HTMLElement;

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.remove("max-md:translate-x-[120%]");
    if (sidebar && toggleBtn && sidebarIcon) {
      if (isSidebarOpen) {
        sidebar.classList.remove("sidebar-flex");
        sidebar.classList.add("sidebar-hidden");

        sidebarIcon.classList.add("rotate-y-180");

        isSidebarOpen = false;
      } else {
        sidebar.classList.remove("sidebar-hidden");
        sidebar.classList.add("sidebar-flex");

        sidebarIcon.classList.remove("rotate-y-180");

        isSidebarOpen = true;
      }
    }
  });
};

setupInputListeners();
toggleBtnClick();
