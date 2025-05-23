/**
 * Contains model, interactive elements, PointerLockControls
 */
import React, { useRef, useEffect, useMemo, useState } from "react"; // Removed useState, Suspense (if ShowroomCarModel handles its own)
import { PointerLockControls, Html } from "@react-three/drei"; // Removed useGLTF, Text (handled by ShowroomCarModel)
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// model components
import ShowroomCarModel from "./Models/ShowroomCarModel";
import Garage from "./Models/Garage";
import Ground from "./Models/Ground";

// decor items
import WallPoster from "./Decor/WallPoster";
import DisplayPlatform from "./Decor/DisplayPlatform";

// store and hooks
import useAppStore from "../store/useAppStore";
import useKeyboardInput from "../hooks/useKeyboardInput";
import usePointerLockControlsManager from "../hooks/usePointerLockControlsManager";

// import CAR List
import { CAR_LIST } from "../carData";

// If ShowroomCarModel handles its own Suspense, preloading here might still be beneficial
// for an aggregate loading experience or can be removed if each model's suspense is sufficient.
// CAR_LIST.forEach((car) => useGLTF.preload(car.path)); // useGLTF is in ShowroomCarModel

const Experience = () => {
  const { camera } = useThree(); // R3F camera, distinct from PointerLockControls' camera object
  const {
    showStartPanel,
    selectedObject,
    setSelectedObject,
    isPointerLocked: storeIsPointerLocked, // Aliased for clarity: this is from Zustand store
    setShowObjectInfoPanel,
    // setShowStartPanel, // Managed by the hook
  } = useAppStore();

  // 1. Define controlsRef first
  const controlsRef = useRef(null);

  // 3. Hook that depends on controlsRef
  const {
    lockControls,
    unlockControls, // Use this to unlock
    isLocked: plcIsLocked, // Actual lock state from the PointerLockControls instance
  } = usePointerLockControlsManager(controlsRef);

  const moveForward = useKeyboardInput("KeyW");
  const moveBackward = useKeyboardInput("KeyS");
  const moveLeft = useKeyboardInput("KeyA");
  const moveRight = useKeyboardInput("KeyD");

  const axesHelper = useMemo(() => new THREE.AxesHelper(1000), []);

  // Effect to lock controls when the start panel is hidden by user action
  useEffect(() => {
    if (
      !showStartPanel &&
      !storeIsPointerLocked && // Check app's desired state
      !plcIsLocked // Check actual browser lock state
    ) {
      // lockControls function from the hook already checks if controlsRef.current exists
      lockControls();
    }
  }, [
    showStartPanel,
    storeIsPointerLocked,
    plcIsLocked,
    lockControls,
    // controlsRef, // controlsRef object itself rarely changes,
  ]); // Added controlsRef to deps

  // Frame loop for camera movement when pointer is locked
  useFrame((state, delta) => {
    // Use plcIsLocked (actual lock state) for movement logic as it's most direct
    if (plcIsLocked && controlsRef.current) {
      const speed = 200 * delta; // Adjusted speed
      const camObject = controlsRef.current.getObject(); // This is the THREE.Camera managed by PointerLockControls

      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);

      // Apply camera's quaternion to get world direction
      // No need to normalize here as applyQuaternion preserves length of unit vectors
      forward.applyQuaternion(camObject.quaternion);
      right.applyQuaternion(camObject.quaternion);

      // Constrain movement to XZ plane
      forward.y = 0;
      right.y = 0;
      forward.normalize(); // Normalize after setting y=0
      right.normalize(); // Normalize after setting y=0

      const movement = new THREE.Vector3();
      if (moveForward) movement.add(forward);
      if (moveBackward) movement.sub(forward);
      if (moveLeft) movement.sub(right);
      if (moveRight) movement.add(right);

      if (movement.lengthSq() > 0) {
        // Only move if there's input
        movement.normalize().multiplyScalar(speed);
        camObject.position.add(movement);
      }

      // Optional: Force camera Y position if you want strict height locking
      // camObject.position.y = 100;
    }
  });

  // Handler for clicking non-car objects (e.g., Garage)
  const handleGenericObjectClick = (event) => {
    event.stopPropagation();
    let currentObject = event.object;
    // Traverse up to see if the click was on a part of a car managed by ShowroomCarModel
    while (currentObject) {
      if (currentObject.userData?.isCarRoot) {
        // Click is on a car part, its root ShowroomCarModel handles navigation to podium
        return;
      }
      currentObject = currentObject.parent;
    }

    // If not a car part, proceed to show info panel
    if (event.object) {
      setSelectedObject(event.object); // Set in Zustand for info panel and outline
      setShowObjectInfoPanel(true);
      if (plcIsLocked) {
        // Check actual lock state
        unlockControls(); // Use the hook's unlock function
      }
      console.log(
        "Clicked generic object:",
        event.object.name || event.object.uuid
      );
    }
  };

  const handlePointerOver = (event, itemData) => {
    event.stopPropagation();
    // For outline effect: if hovering over a non-car interactive object
    if (!itemData && event.object && !event.object.userData?.isCarRoot) {
      setSelectedObject(event.object); // Temporarily select for outline
    }
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    // Clear temporary selection if it was for hover and not a car part
    if (selectedObject === event.object && !event.object.userData?.isCarRoot) {
      setSelectedObject(null);
    }
    document.body.style.cursor = "auto";
  };

  return (
    <>
      {/* PointerLockControls setup. selector="#root" allows re-locking by clicking the canvas. */}
      <PointerLockControls ref={controlsRef} selector="#root" />
      <primitive object={axesHelper} />

      <Ground />

      <Garage
        position={[0, -50, -1500]}
        scale={[0.6, 0.3, 0.6]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleGenericObjectClick}
        name="ShowroomGarage"
      />

      {CAR_LIST.map((car) => (
        // ShowroomCarModel should handle its own Suspense for model loading
        <ShowroomCarModel
          key={car.id}
          carData={car}
          onPointerOver={handlePointerOver} // Pass handlers for consistent interaction
          onPointerOut={handlePointerOut}
          // onClick for cars is handled internally by ShowroomCarModel for navigation
        />
      ))}

      <WallPoster
        imageUrl="/textures/cracked-cement.jpg"
        position={[-700, 150, -2200]}
        size={[300, 200]}
      />

      {CAR_LIST.map((car) => (
        <DisplayPlatform
          key={`platform-${car.id}`}
          position={[
            car.showroomPosition[0],
            // Adjust Y: car's y + half its scaled height (approx) - platform height / 2
            // This is a rough estimation, actual car model origin matters.
            // For now, using your previous logic, ensure showroomPosition.y is ground level for the car.
            car.showroomPosition[1] - car.showroomScale[1] * 0.1 - 5, // Original logic
            car.showroomPosition[2],
          ]}
          radius={Math.max(car.showroomScale[0], car.showroomScale[2]) * 1.2} // Adjusted multiplier
          height={10}
        />
      ))}
    </>
  );
};

export default Experience;
