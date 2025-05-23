// src/components/Podium/scene/PodiumSceneSetup.jsx
import React, { useEffect, useRef } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import Stats from "three/examples/jsm/libs/stats.module.js";
import * as THREE from "three"; // For THREE.SpotLight target

export function PodiumLighting() {
  return (
    <>
      <ambientLight color={0x505050} intensity={1.0} />
      {/**  Simulates a primary light source like the sun,
          casting parallel rays from a specific direction. This is typically the brightest light.*/}
      <directionalLight // Key light
        color={0xffffff}
        intensity={1.2}
        position={[50, 100, 30]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={400}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {/**A secondary light used to soften shadows cast by the key light
          and illuminate areas that might otherwise be too dark. Often less intense and can have a cooler color. */}
      <directionalLight // Fill light
        color={0x8080ff}
        intensity={0.3}
        position={[-50, 30, -30]}
      />
    </>
  );
}

export function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial
        color={0xcccccc}
        roughness={0.1}
        metalness={0.3}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

// Spotlights specifically for the car, targeting the carContainer
//  point to the 3D object representing the car in your scene.
// podiumCenter represents the 3d coordinates (x, y,z) of the center of the podium
export function CarSpotlights({ carContainerRef, podiumCenter }) {
  // Refs to directly access the Three.js SpotLight objects
  // carSpotlight and sideSpotlight look at the car itself.
  const carSpotlightRef = useRef();
  const sideSpotlightRef = useRef();
  // frontSpotlight looks at the podium center.
  const frontSpotlightRef = useRef();

  // ref frontSpotlightTargetRef is a custom target (THREE.Object3D) to let the front spotlight point at a specific location.
  const frontSpotlightTargetRef = useRef(new THREE.Object3D()); // For front spotlight target

  // useEffect to set the targets of the spotlights once the refs are populated and props are available
  useEffect(() => {
    if (
      carContainerRef.current && // The car container exists
      frontSpotlightRef.current && //  The front spotlight mesh exists
      frontSpotlightTargetRef.current && // The target object for front spotlight exists
      podiumCenter // The center position of the podium is known
    ) {
      //
      frontSpotlightTargetRef.current.position.set(
        podiumCenter.x,
        podiumCenter.y,
        podiumCenter.z
      );
      frontSpotlightRef.current.target = frontSpotlightTargetRef.current;
    }
    if (carSpotlightRef.current && carContainerRef.current) {
      carSpotlightRef.current.target = carContainerRef.current;
    }
    if (sideSpotlightRef.current && carContainerRef.current) {
      sideSpotlightRef.current.target = carContainerRef.current;
    }
  }, [carContainerRef, carContainerRef.current, podiumCenter]);

  if (!podiumCenter) return null; // Wait for podiumCenter

  return (
    <>
      {/* Target for front spotlight */}
      <primitive object={frontSpotlightTargetRef.current} />

      <spotLight // Car spotlight (main)
        ref={carSpotlightRef}
        color={0xffffff}
        intensity={3}
        position={[0, 120, 0]} // Relative to scene origin or car? podium.js positions it at scene 0,120,0
        angle={Math.PI / 6}
        penumbra={0.5}
        decay={1.5}
        distance={500}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight // Side spotlight
        ref={sideSpotlightRef}
        color={0xffffaa}
        intensity={2}
        position={[100, 80, 100]}
        angle={Math.PI / 8}
        penumbra={0.7}
        decay={1.5}
        distance={400}
        castShadow
      />
      <spotLight // Front spotlight (relative to podium center)
        ref={frontSpotlightRef}
        color={0xffffff}
        intensity={2}
        position={[podiumCenter.x, podiumCenter.y + 20, podiumCenter.z + 100]} // Adjusted based on podium.js (podiumFrontZ + 80)
        angle={Math.PI / 6}
        penumbra={0.5}
        decay={1.5}
        distance={300}
        castShadow
      />
    </>
  );
}

export function PodiumOrbitControls() {
  const { camera, gl } = useThree();
  // Target is set from podium.js: controls.target.set(0, 15, 0);
  // This will be dynamically set if podiumCenter is available, or defaults to 0,15,0
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 15, 0); // Default target
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      minDistance={20}
      maxDistance={150}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.6}
    />
  );
}

export function PodiumEnvironment() {
  // Using a preset environment from Drei. podium.js doesn't explicitly load one,
  // but relies on scene.background and lights. This adds PBR reflections.
  return <Environment preset="dawn" background blur={0.3} />; // Or "city", "dawn", etc.
}

// This adds a performance monitor HUD using the stats.js library — like FPS, CPU usage, etc.
export function StatsMonitor() {
  const statsNodeRef = useRef(null); // Ref for the DOM node to append stats ( holds a container div)
  const statsInstanceRef = useRef(null); // Ref for the Stats instance

  useEffect(() => {
    // Create a div for stats to live in, append to body
    const node = document.createElement("div");
    node.style.position = "absolute";
    node.style.top = "0px";
    node.style.left = "0px";
    document.body.appendChild(node);
    statsNodeRef.current = node;

    statsInstanceRef.current = new Stats();
    statsNodeRef.current.appendChild(statsInstanceRef.current.dom);

    return () => {
      if (statsInstanceRef.current && statsNodeRef.current) {
        statsNodeRef.current.removeChild(statsInstanceRef.current.dom);
      }
      if (statsNodeRef.current && statsNodeRef.current.parentNode) {
        statsNodeRef.current.parentNode.removeChild(statsNodeRef.current);
      }
    };
  }, []);

  useFrame(() => {
    if (statsInstanceRef.current) {
      statsInstanceRef.current.update();
    }
  });

  return null;
}
