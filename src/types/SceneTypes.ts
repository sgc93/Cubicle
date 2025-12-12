import * as THREE from "three";

export type ObjectType =
  | "box"
  | "mesh"
  | "plane"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "text";

export type ObjectModeType = "translate" | "rotate" | "scale";

export type SceneObject = {
  id: string;
  type: string;
  name: string;
  mesh: THREE.Mesh;
  mode: ObjectModeType;
};
