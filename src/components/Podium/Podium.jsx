// src/components/Podium/Podium.jsx
import React, { useEffect, useState, useRef } from "react"; // Removed Suspense, useMemo, useFrame, useThree, useTexture, Html
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import * as THREE from "three"; // Keep for THREE.Group and THREE.MathUtils if PodiumGUI uses it indirectly

import { Leva } from "leva";
import { PodiumSceneContent } from "./scene/PodiumSceneContent";
import { PodiumGUI } from "./ui/PodiumGUI";

// Simple HTML Loader for pre-Canvas states
function SimpleHtmlLoader({ text = "Loading..." }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#333",
        background: "rgba(255,255,255,0.9)",
        padding: "20px",
        borderRadius: "10px",
        fontSize: "1.5em",
        zIndex: 2000,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

export function Podium() {
  const navigate = useNavigate();
  const [localStorageCar, setLocalStorageCar] = useState(null); // Stores car info loaded from localStorage
  const [isAppLoading, setIsAppLoading] = useState(true); // True while checking/loading car data.
  const [initialSceneLoadDone, setInitialSceneLoadDone] = useState(false); // True when the 3D scene finishes loading.

  // populated carContainerRef with THREE.Group()
  const carContainerRef = useRef(new THREE.Group()); // A Three.js group container for placing the car model

  // Stores the current texture for the podium (default or user-uploaded).
  const [podiumTextures, setPodiumTextures] = useState({ customMap: null }); // Stores uploaded THREE.Texture
  const [currentPodiumTextureType, setCurrentPodiumTextureType] =
    useState("Default");

  // Controls whether the car rotates automatically.
  const [autoRotateState, setAutoRotateState] = useState({
    enabled: true,
    speed: 0.5,
  });

  // Stores the car's position after it's placed—used for GUI resets.
  const [defaultCarPosition, setDefaultCarPosition] = useState(null); // For GUI defaults

  // Load initial car from localStorage
  useEffect(() => {
    const carDataString =
      localStorage.getItem("selectedCarForPodium") ||
      localStorage.getItem("selectedCar");
    let carDataToSet;
    if (carDataString) {
      try {
        carDataToSet = JSON.parse(carDataString);
      } catch (e) {
        console.error("Error parsing selected car from localStorage:", e);
        carDataToSet = {
          path: "/Car/Car.fbx",
          name: "DefaultCar",
          displayName: "Default FBX Car",
        };
      }
    } else {
      carDataToSet = {
        path: "/Car/Car.fbx",
        name: "DefaultCar",
        displayName: "Default FBX Car",
      };
    }
    setLocalStorageCar(carDataToSet);
    setIsAppLoading(false); // Done with localStorage part
  }, []);

  const handleBack = () => {
    localStorage.removeItem("selectedCarForPodium");
    // Your original podium.js also removed "selectedCar". It's good to be consistent.
    localStorage.removeItem("selectedCar");

    // Navigate back to the root page (showroom)
    navigate("/");
    console.log("Navigating back to showroom, cleared podium localStorage.");
  };

  const handleTextureUpload = (imageUrl, fileName) => {
    console.log("Uploading texture:", fileName);
    const newTexture = new THREE.TextureLoader().load(
      imageUrl, // url oor path to image file to load as a texture
      (tex) => {
        // receive tex as loaded texture
        // set texture properties
        tex.encoding = THREE.sRGBEncoding;
        tex.needsUpdate = true; // Crucial for texture to update
        setPodiumTextures({ customMap: newTexture });
        setCurrentPodiumTextureType("Custom Upload"); // Update type
        console.log("Custom texture applied state updated.");
      }, // onload callback function
      undefined, // onProgress (callback function)
      (err) => {
        // onError (callback function)
        console.error("Error loading custom texture:", err);
      }
    );
  };

  const handleResetPodiumTexture = () => {
    console.log("Resetting podium texture to default.");
    setPodiumTextures({ customMap: null }); // Clear custom map
    setCurrentPodiumTextureType("Default");
  };

  if (isAppLoading) {
    // Show loader while fetching from localStorage
    return <SimpleHtmlLoader text={"Initializing Podium..."} />;
  }
  if (!localStorageCar) {
    // Fallback if localStorageCar is still null after initial check
    return <SimpleHtmlLoader text={"Error: Car data not found."} />;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#e0e0e0",
      }}
    >
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1001 }}>
        {" "}
        {/* Higher zIndex for UI */}
        <button
          onClick={handleBack}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "1px solid white",
            borderRadius: "5px",
          }}
        >
          ← Back to Showroom
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)", // Adjust for exact centering
          zIndex: 1001,
          color: "#333",
          background: "rgba(255,255,255,0.7)",
          padding: "10px 20px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        <h2>{localStorageCar.displayName || localStorageCar.name}</h2>
      </div>

      {/* PodiumGUI gives you controls to interact with that scene. */}
      <PodiumGUI
        carContainerRef={carContainerRef}
        defaultCarPosition={defaultCarPosition} // Pass calculated default for Leva
        autoRotateState={autoRotateState}
        setAutoRotateState={setAutoRotateState}
        currentPodiumTextureType={currentPodiumTextureType}
        setCurrentPodiumTextureType={setCurrentPodiumTextureType}
        onTextureUpload={handleTextureUpload}
        onResetPodiumTexture={handleResetPodiumTexture}
      />

      {/* Canvas show the 3D car and podium */}
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 40, 150] }} // Initial camera
        gl={{
          antialias: true,
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          preserveDrawingBuffer: false, // Usually false for performance, true if you need to screenshot
        }}
      >
        <PodiumSceneContent
          localStorageCar={localStorageCar}
          carContainerRef={carContainerRef}
          initialLoadDone={initialSceneLoadDone}
          setInitialLoadDone={setInitialSceneLoadDone}
          autoRotateState={autoRotateState}
          currentPodiumTextureType={currentPodiumTextureType}
          customMapTextureObject={podiumTextures.customMap}
          setDefaultCarPosition={setDefaultCarPosition} // Pass setter
        />
      </Canvas>

      {!initialSceneLoadDone && ( // This overlay shows until PodiumSceneContent signals it's ready
        <SimpleHtmlLoader text="Loading 3D Scene..." />
      )}
    </div>
  );
}
