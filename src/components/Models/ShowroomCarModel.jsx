// src/components/Models/ShowroomCarModel.jsx
import React, { useEffect, useMemo, Suspense } from "react";
import { useGLTF, Text, Html } from "@react-three/drei";
import { useNavigate } from "react-router-dom";

// Helper to show a simple loading text for individual models
function ModelLoaderFallback({ carName }) {
  return (
    <Html center>
      <p
        style={{
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        Loading {carName}...
      </p>
    </Html>
  );
}

function ShowroomCarModel({ carData, onPointerOver, onPointerOut }) {
  // useGLTF will suspend the component until the model is loaded
  // Ensure carData.path is correct and points to a file in the /public directory
  // console.log(carData.displayName);
  const { scene } = useGLTF(carData.path);
  const navigate = useNavigate();

  // Memoize the cloned scene to prevent re-cloning on every render and allow independent instances
  const clonedScene = useMemo(() => {
    if (scene) return scene.clone();
    return null; // Handle case where scene might not be immediately available (though useGLTF suspends)
  }, [scene]);

  // Set shadows for all meshes in the car
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          // child.receiveShadow = true; // Optional, if cars can receive shadows from each other or environment
        }
      });
    }
  }, [clonedScene]);

  const handlePointerClick = (event) => {
    event.stopPropagation(); // Prevent event from bubbling up to canvas or other elements
    //     carData properties (for example)
    // id: "astonMartin",
    //     originalName: "AstonMartinValour",
    //     displayName: "Aston Martin Valour",
    //     path: "/mclaren/aston_martin_valour_2024__www.vecarz.com/scene.gltf",
    //     // Original scale was 14000. This will need a lot of tuning.
    //     showroomScale: [30, 30, 30], // Adjust this drastically!
    //     showroomPosition: [0, 0, 400], // Example position
    //     showroomRotationY: Math.PI,
    //     podiumScale: [0.6, 0.6, 0.6], // Adj
    const carInfoForPodium = {
      displayName: carData.displayName,
      path: carData.path,
      originalName: carData.originalName, // Keep if used elsewhere
      podiumScale: carData.podiumScale,
      showroomRotationY: carData.showroomRotationY, // Pass for consistent initial orientation on podium
    };
    localStorage.setItem(
      "selectedCarForPodium",
      JSON.stringify(carInfoForPodium)
    );
    navigate("/podium");
  };

  if (!clonedScene) {
    // This should ideally not be hit often because useGLTF suspends,
    // but it's a good fallback. The Suspense boundary in Experience.jsx is the primary loader.
    return <ModelLoaderFallback carName={carData.displayName} />;
  }

  return (
    <group
      position={carData.showroomPosition}
      rotation-y={carData.showroomRotationY || 0} // Default to 0 if not specified
      onClick={handlePointerClick}
      // Pass the event and carData to the handlers from Experience.jsx
      // This allows Experience.jsx to manage hover states for outlines if needed
      onPointerOver={(e) => {
        e.stopPropagation();
        if (onPointerOver) onPointerOver(e, carData);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (onPointerOut) onPointerOut(e);
      }}
      userData={{ isCarRoot: true, carId: carData.id }} // Add userData for easier identification
    >
      <primitive object={clonedScene} scale={carData.showroomScale} />
      <Text
        position={[0, -0.7, 0]} // Adjust Y based on average car height and scale
        fontSize={0.25} // Adjust size
        color="white"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {carData.displayName}
      </Text>
    </group>
  );
}

// Wrap the component with Suspense for its internal useGLTF loading
const SuspendedShowroomCarModel = (props) => (
  <Suspense
    fallback={
      <ModelLoaderFallback carName={props.carData?.displayName || "Car"} />
    }
  >
    <ShowroomCarModel {...props} />
  </Suspense>
);

export default SuspendedShowroomCarModel;
// Or if you handle suspense higher up exclusively:
// export default ShowroomCarModel;
