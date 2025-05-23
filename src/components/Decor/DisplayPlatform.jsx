// src/components/Decor/DisplayPlatform.jsx
import React from "react";
import { Cylinder } from "@react-three/drei";

const DisplayPlatform = ({
  position = [0, 0, 0],
  radius = 250, // Default radius
  height = 10, // Default height
  color = 0x333333,
  metalness = 0.4,
  roughness = 0.6,
}) => {
  return (
    <Cylinder
      args={[radius, radius, height, 32]} // args for the geometry
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </Cylinder>
  );
};

export default DisplayPlatform;
