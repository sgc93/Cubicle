import type { SceneObject } from "../types/SceneTypes";
import { getSvg } from "../utils/getSvg";

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
  selectedObj: SceneObject
) => {
  const listBox = document.getElementById(
    "open-objects-list-box"
  ) as HTMLDivElement | null;

  if (!listBox) {
    return;
  }

  listBox.innerHTML = "";
  const parser = new DOMParser();

  sceneObjects.forEach((object) => {
    const isSelected = object.id === selectedObj.id;
    const htmlString = createListObjectHTML(object, isSelected);
    const doc = parser.parseFromString(htmlString, "text/html");
    const itemElement = doc.body.firstChild;

    if (itemElement) {
      listBox.appendChild(itemElement);
    }
  });
};

export const displaySelectedOjbect = (object: SceneObject) => {
  console.log(object);
};
