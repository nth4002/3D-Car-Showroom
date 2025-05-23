// src/components/Podium/scene/PodiumSceneContent.jsx
import React, {
  Suspense,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useFrame, useThree } from "@react-three/fiber"; // Added useThree
import { useTexture, Html } from "@react-three/drei";
import * as THREE from "three";

import { PodiumPlatform, PodiumCar } from "../models/PodiumAssetLoader";
import {
  PodiumLighting,
  ReflectiveFloor,
  CarSpotlights,
  PodiumOrbitControls,
  PodiumEnvironment,
  StatsMonitor,
} from "./PodiumSceneSetup";

export function R3FLoaderFallback({ text = "Loading Assets..." }) {
  return (
    <Html
      center // Centers the HTML content within its Drei <group> wrapper
      style={{
        color: "white",
        fontSize: "1.5em",
        whiteSpace: "nowrap", // Prevents text from wrapping
        background: "rgba(0,0,0,0.7)", // Semi-transparent dark background
        padding: "15px 25px", // Padding around the text
        borderRadius: "8px", // Rounded corners
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)", // Soft shadow for depth
        pointerEvents: "none", // Ensure it doesn't block interactions with underlying elements once loaded
      }}
    >
      {text}
    </Html>
  );
}

export function PodiumSceneContent({
  localStorageCar, // info about the selected car.
  carContainerRef, // a THREE.Group() where the car model will be added.
  initialLoadDone, // track if assets are fully loaded.
  setInitialLoadDone,
  autoRotateState, // whether the car should spin.
  currentPodiumTextureType, // "Default" or "Custom Upload".
  customMapTextureObject, // uploaded texture.
  setDefaultCarPosition, // callback to report default car position to the parent GUI.
}) {
  // Local state to store the loaded podium and car 3D objects.
  const [localPodiumObject, setLocalPodiumObject] = useState(null);
  const [localCarObject, setLocalCarObject] = useState(null);

  // Gives access to the R3F camera for positioning.
  const { camera } = useThree(); // For adjusting camera after load

  // Default Podium Textures
  const defaultPodiumTextures = {
    // useTexture Loads textures for the podium.
    normalMap: useTexture("/Podium/low_podium_Normal.png"),
    emissiveMap: useTexture("/Podium/low_podium_Emissive.png"),
    ormMap: useTexture("/Podium/low_podium_OcclusionRoughnessMetallic.png"),
  };
  // Apply encoding once after textures are loaded
  useEffect(() => {
    if (defaultPodiumTextures.normalMap)
      defaultPodiumTextures.normalMap.encoding = THREE.LinearEncoding;
    if (defaultPodiumTextures.emissiveMap)
      defaultPodiumTextures.emissiveMap.encoding = THREE.sRGBEncoding;
  }, [defaultPodiumTextures.normalMap, defaultPodiumTextures.emissiveMap]);

  const podiumMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      normalMap: defaultPodiumTextures.normalMap,
      normalScale: new THREE.Vector2(1, 1),
      emissiveMap: defaultPodiumTextures.emissiveMap,
      emissive: new THREE.Color(0x00ffff),
      emissiveIntensity: 1.5,
      aoMap: defaultPodiumTextures.ormMap,
      roughnessMap: defaultPodiumTextures.ormMap,
      metalnessMap: defaultPodiumTextures.ormMap,
      roughness: 0.5,
      metalness: 0.8,
      envMapIntensity: 1.5,
      color: 0x444444,
    });

    if (
      currentPodiumTextureType === "Custom Upload" &&
      customMapTextureObject
    ) {
      mat.map = customMapTextureObject;
      mat.color.set(0xffffff); // As per podium.js applyCustomTexture
      mat.roughness = 0.7;
      mat.metalness = 0.3;
      // Keep other maps like normal, emissive, orm for consistency with podium.js logic
      // Or decide if custom map should override them entirely. podium.js re-creates material.
    }
    return mat;
  }, [defaultPodiumTextures, currentPodiumTextureType, customMapTextureObject]);

  // Stores the loaded podium object in state.
  const handlePodiumLoaded = useCallback(
    (loadedPodium) => setLocalPodiumObject(loadedPodium),
    []
  );
  // Stores the loaded car object in state.
  const handleCarLoaded = useCallback(
    (loadedCar) => setLocalCarObject(loadedCar),
    []
  );

  // Positioning and Camera Adjustment Effect
  useEffect(() => {
    if (localPodiumObject && carContainerRef.current) {
      // Check carContainerRef always
      const podiumBox = new THREE.Box3().setFromObject(localPodiumObject);
      const podiumCenter = podiumBox.getCenter(new THREE.Vector3());
      const podiumTopY = podiumBox.max.y;

      let carIsReady = false;
      let carEffectiveHeight = 0; // To store the car's height after scaling

      if (localCarObject) {
        while (carContainerRef.current.children.length > 0) {
          carContainerRef.current.remove(carContainerRef.current.children[0]);
        }

        // Reset car's local transformations before adding to container
        localCarObject.position.set(0, 0, 0);
        localCarObject.rotation.set(0, 0, 0);
        localCarObject.rotation.y = Math.PI; // Face forward

        // Apply scaling
        if (localCarObject.userData.isGLTF) {
          if (localCarObject.userData.modelType === "Ferrari")
            localCarObject.scale.set(800, 800, 800);
          else if (localCarObject.userData.modelType === "Aspark")
            localCarObject.scale.set(8, 8, 8);
          else if (localCarObject.userData.modelType === "Bugatti")
            localCarObject.scale.set(8, 8, 8);
          else localCarObject.scale.set(8, 8, 8);
        } else {
          // FBX
          localCarObject.scale.set(1, 1, 1);
        }
        localCarObject.updateMatrixWorld(true);

        // Calculate the bounding box of the SCALED car
        const carBox = new THREE.Box3().setFromObject(localCarObject);
        // const carModelCenterOffset = carBox.getCenter(new THREE.Vector3());
        const carSize = carBox.getSize(new THREE.Vector3());
        carEffectiveHeight = carSize.y; // Height of the scaled car

        // Calculate the offset needed to place the car's bottom at the container's origin (0,0,0)
        // carBox.min.y is the lowest point of the car relative to its own origin.
        // We want to shift the car up so this lowest point becomes 0 in the container's Y.
        const carPivotOffset = new THREE.Vector3(
          carBox.getCenter(new THREE.Vector3()).x, // Keep X and Z centered
          carBox.min.y, // This is the key change
          carBox.getCenter(new THREE.Vector3()).z
        );

        localCarObject.position.sub(carPivotOffset); // Shift car so its bottom is at y=0 within the container

        // localCarObject.position.sub(carModelCenterOffset);
        carContainerRef.current.add(localCarObject);
        carIsReady = true;
      }

      // Set default car position for GUI and current position
      // const carDefaultX = podiumCenter.x; // podium.js uses 0 for container X
      // const carDefaultY = podiumTopY; // + 0.2;
      // const carDefaultZ = podiumCenter.z - 52; // podium.js uses -52 for container Z relative to podium center implicitly being 0

      const carContainerDefaultX = podiumCenter.x;
      const carContainerDefaultY = podiumTopY; // Place the car's bottom directly on the podium top
      const carContainerDefaultZ = podiumCenter.z - 52; // Your Z offset from podium.js
      if (setDefaultCarPosition)
        setDefaultCarPosition({
          // x: carDefaultX,
          // y: carDefaultY,
          // z: carDefaultZ,
          x: carContainerDefaultX,
          y: carContainerDefaultY + carEffectiveHeight / 2,
          z: carContainerDefaultZ,
        });

      carContainerRef.current.position.set(
        // carDefaultX,
        // carDefaultY,
        // carDefaultZ
        carContainerDefaultX,
        carContainerDefaultY,
        carContainerDefaultZ
      );
      if (!localCarObject) {
        carContainerRef.current.rotation.set(0, 0, 0);
      }
      // carContainerRef.current.rotation.set(0, 0, 0);

      // Camera adjustment from podium.js
      const podiumFrontZ = podiumBox.max.z + 20;
      // const podiumCamTargetY = podiumCenter.y + 10;

      const podiumCamTargetY =
        podiumCenter.y +
        (carEffectiveHeight > 0 ? carEffectiveHeight * 0.5 : 10); // Target middle of car or podium
      camera.position.set(
        podiumCenter.x + 30,
        podiumCamTargetY + 15,
        podiumFrontZ + 60
      );

      // OrbitControls target is set in PodiumOrbitControls component, but we can update it here if needed after load
      const controls = camera.parent?.getObjectByProperty(
        "type",
        "OrbitControls"
      ); // Attempt to get controls
      if (controls) {
        controls.target.set(podiumCenter.x, podiumCamTargetY, podiumCenter.z);
        controls.update();
      }

      if (
        !initialLoadDone &&
        (carIsReady || (!localStorageCar?.path && !localCarObject))
      ) {
        setInitialLoadDone(true);
      }
    }
  }, [
    localPodiumObject,
    localCarObject,
    localStorageCar,
    carContainerRef,
    initialLoadDone,
    setInitialLoadDone,
    camera,
    setDefaultCarPosition,
  ]);

  useFrame((state, delta) => {
    if (autoRotateState && autoRotateState.enabled && carContainerRef.current) {
      carContainerRef.current.rotation.y += autoRotateState.speed * delta;
    }
  });

  return (
    <>
      <StatsMonitor />
      <PodiumLighting />
      <ReflectiveFloor />
      <PodiumOrbitControls />
      <PodiumEnvironment />

      {/* Render car spotlights only when podium and car container are ready */}
      {localPodiumObject && carContainerRef.current && initialLoadDone && (
        <CarSpotlights
          carContainerRef={carContainerRef}
          podiumCenter={localPodiumObject.getWorldPosition(new THREE.Vector3())}
        />
      )}

      <Suspense
        fallback={
          <R3FLoaderFallback
            text={!initialLoadDone ? "Loading assets..." : "Finalizing..."}
          />
        }
      >
        <PodiumPlatform
          onPodiumLoaded={handlePodiumLoaded}
          podiumMaterial={podiumMaterial}
        />
        {localStorageCar?.path && (
          <PodiumCar
            key={localStorageCar.path + (localStorageCar.name || "")}
            carPath={localStorageCar.path}
            carName={localStorageCar.name}
            onCarLoaded={handleCarLoaded}
          />
        )}
        <primitive object={carContainerRef.current} />
      </Suspense>
    </>
  );
}
