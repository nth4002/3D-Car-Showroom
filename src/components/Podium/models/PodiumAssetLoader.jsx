// src/components/Podium/models/PodiumAssetLoader.jsx
import React, { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"; // For Draco compressed GLTFs

// Podium Platform (FBX)
export function PodiumPlatform({ onPodiumLoaded, podiumMaterial }) {
  const fbx = useLoader(FBXLoader, "/Podium/low.fbx"); // Path relative to /public
  const platformInstanceRef = useRef(null); //Create a ref to store the processed Three.js instance of the podium.

  // useEffect hook to process the model once it's loaded (`fbx` is available).
  useEffect(() => {
    if (fbx && !platformInstanceRef.current) {
      const clonedPodium = fbx.clone();
      clonedPodium.traverse((child) => {
        if (child.isMesh) {
          child.material = podiumMaterial; // Applied from parent
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      clonedPodium.scale.set(0.5, 0.5, 0.5);
      clonedPodium.position.y = 0;
      clonedPodium.rotation.y = 0;
      platformInstanceRef.current = clonedPodium; //Store this processed instance in our ref.
      if (onPodiumLoaded) onPodiumLoaded(clonedPodium); // getPodiumObjectRef populated
    }
  }, [fbx, onPodiumLoaded, podiumMaterial]);

  //  useEffect hook to update the material if the `podiumMaterial` prop changes
  //     (e.g., when a custom texture is uploaded).
  useEffect(() => {
    if (platformInstanceRef.current && podiumMaterial) {
      platformInstanceRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = podiumMaterial;
        }
      });
    }
  }, [podiumMaterial]);

  // Render the podium model.
  //     - If `platformInstanceRef.current` has our processed model, render it using `<primitive>`.
  //     - `<primitive object={...} />` is R3F's way to render an existing Three.js Object3D.
  //     - Otherwise, render `null` (while loading or if loading failed and `fbx` is null).
  return platformInstanceRef.current ? (
    <primitive object={platformInstanceRef.current} />
  ) : null;
}

// Car Model (FBX or GLTF)
export function PodiumCar({ carPath, carName, onCarLoaded }) {
  const fileExtension = carPath ? carPath.split(".").pop().toLowerCase() : "";
  const modelInstanceRef = useRef(null); // To store the THREE.Object3D

  // /useEffect hook to perform side effects, in this case, loading the 3D model.
  // - This effect will run after the component mounts and whenever any of its dependencies
  //   (carPath, carName, fileExtension, onCarLoaded) change.
  useEffect(() => {
    //  Handle the case where no carPath is provided.
    if (!carPath) {
      if (onCarLoaded) onCarLoaded(null);
      return;
    }

    //  Reset the stored model instance when a new carPath is provided.
    modelInstanceRef.current = null;
    // 'active' flag for cleanup in asynchronous operations.
    // This helps prevent calling `onCarLoaded` or other state updates if the component
    // unmounts while the asynchronous model loading is still in progress.
    let active = true;

    //  Define an asynchronous function to load the model.
    // Using async/await makes the asynchronous loading code easier to read.
    const loadModel = async () => {
      try {
        // initialize loadedData with object stored in carPath
        let loadedData;
        if (fileExtension === "fbx") {
          const loader = new FBXLoader();
          loadedData = await loader.loadAsync(carPath);
        } else if (fileExtension === "gltf" || fileExtension === "glb") {
          const loader = new GLTFLoader();
          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath("/draco/gltf/"); // Ensure Draco decoders are in public/draco/gltf/
          loader.setDRACOLoader(dracoLoader);
          const gltf = await loader.loadAsync(carPath);
          loadedData = gltf.scene;
        } else {
          throw new Error(`Unsupported file format: ${fileExtension}`);
        }

        if (!active) return; // Component unmounted during load

        // assign the information to carModelInstance
        const carModelInstance = loadedData.clone();
        carModelInstance.name = carName; // Assign the name from props (derived from localStorage)
        carModelInstance.userData = carModelInstance.userData || {};
        carModelInstance.userData.isGLTF =
          fileExtension === "gltf" || fileExtension === "glb";

        if (carPath?.includes("ferrari")) {
          carModelInstance.userData.modelType = "Ferrari";
          console.log(carPath);
        } else if (carPath?.includes("bugatti")) {
          carModelInstance.userData.modelType = "Bugatti";
          console.log(carPath);
        } else if (carPath?.includes("aspark")) {
          carModelInstance.userData.modelType = "Aspark";
          console.log(carPath);
        } else if (carPath?.includes("aston_martin")) {
          carModelInstance.userData.modelType = "Aston Martin";
          console.log(carPath);
        }

        carModelInstance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        modelInstanceRef.current = carModelInstance;
        if (onCarLoaded) onCarLoaded(carModelInstance);
      } catch (error) {
        console.error(`Error loading car model ${carPath}:`, error);
        if (active && onCarLoaded) onCarLoaded(null);
      }
    };

    loadModel();

    return () => {
      active = false; // Cleanup for async operations
    };
  }, [carPath, carName, fileExtension, onCarLoaded]);

  // This component's role is to load and call onCarLoaded.
  // The actual rendering (<primitive>) is done by the parent (PodiumSceneContent).
  return null;
}
