/**
 * Contains model, interactive elements, PointerLockControls
 */
import React, { useRef, useEffect, useMemo, useState, Suspense } from "react"; // Removed useState, Suspense (if ShowroomCarModel handles its own)
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

function TestFerrari() {
  // Path relative to /public
  const { scene } = useGLTF(
    "/mclaren/ferrari_monza_sp1_2019__www.vecarz.com/scene.gltf"
  );
  // Start with a large scale if you suspect it's tiny
  return <primitive object={scene} scale={[10000, 10000, 10000]} />;
}
const Experience = () => {
  const { selectedObject, setSelectedObject } = useAppStore();
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
    </>
  );
};

export default Experience;
