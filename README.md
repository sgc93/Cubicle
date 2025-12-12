# CUBICLE : 3D Scene Editor (THREE.js / TypeScript)

A lightweight web-based 3D scene editor built with Three.js for interactive object manipulation and scene management.

---

## How to Run the App

This project uses **Vite** as a modern build tool and development server, and **TypeScript** for code quality.

### Installation & Startup

1.  **Clone the Repository (If applicable):**

    ```bash
    git clone git@github.com:sgc93/Cubicle.git
    cd cubicle
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application will typically be available at `http://localhost:5173/`.

---

## 2. ✅ Completed Features

The core 3D editor functionality and foundational components are complete:

### Scene Setup

- **Initialization:** basic Three.js scene, camera, and WebGL renderer.
- **Lighting:** ambient and directional lighting with shadows enabled.
- **Helpers:** Grid Helper and XYZ Axes Helper.

### Add Shapes

- **Selection:** Primitive meshes (Box, Sphere, Cylinder, Cone, Torus, Plane).

### Object Selection & Deletion

- **Selection:** Clicking on them in the viewport or by using the sidebar list.
- **Highlighting** highlight selected object with bounding box
- **Deletion:** Select Object + Backspace or delete button from sidebar.

### Transformation & Editing

- **Mode Switching:** swith betwee translate, rotate and scale modes with cta buttons or shortcuts: g, r and s respectively.
- **Sidebar Editor:** Manual input fields in the sidebar to precisely set the Position, Rotation (in degrees), and Scale of the selected object.

### Persistence

- **Export Scene:** Exports the current scene state (all objects, types, and transforms) to a downloadable JSON file.
- **Import Scene:** Clears the current scene and reconstructs it based on a loaded JSON file.

---

## 3. 📝 To Do: Fixes and Future Features

With more time, the following features and fixes would be prioritized:

### Priority Fixes (Stability)

- **TransformControls Interactivity:** Resolve the persistent issue where the **Transform Controls gizmo occasionally fails to respond or is overridden by Orbit Controls**, despite the `dragging-changed` listener. This likely requires refining the `onPointerClick` logic to explicitly check for intersection with the gizmo's internal handles _before_ running object selection.
- **Import Counter:** Ensure the `typeCounter` is correctly initialized during import to prevent immediate naming conflicts on subsequent new object creation (e.g., loading "Box (5)" and then creating a new box named "Box (1)").
- **Rotation Display:** Improve how manual rotation input handles gimbal lock scenarios.

### Feature Enhancements (Usability)

- **Undo/Redo History:** Basic state management is implemented to capture changes (Creation, Deletion, Transformation completion) for multi-level undo and redo functionality.

- **Material Editor:** Add UI controls to edit material properties (Color, Roughness, Metalness, Opacity).
- **Light Editor:** Add UI controls to modify the properties of the directional light (Position, Intensity, Color).
- **Group Objects:** Implement the ability to group meshes together using `THREE.Group` for combined transformation.
- **Keyboard Shortcuts:** Extend keyboard shortcuts for utility actions (e.g., Ctrl+S for Save/Export, Duplicate object).

## 4. 💻 Tech Stack

> **3D Engine** : **ThreeJs**
> **Framework** : **Vite** - Fast development server and build tool
> **Language** : **TypeScript**
> **Styling** : **Tailwind CSS** - Utility-first CSS framework for rapid UI crafting
