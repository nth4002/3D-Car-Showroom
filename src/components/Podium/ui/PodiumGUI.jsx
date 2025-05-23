// src/components/Podium/ui/PodiumGUI.jsx
import React from "react";
import { Leva, useControls, button } from "leva";
import * as THREE from "three";

export function PodiumGUI({
  carContainerRef,
  // podiumObject, // Pass only if absolutely needed for reset default values based on podium size
  defaultCarPosition, // Pass the calculated default position
  autoRotateState,
  setAutoRotateState,
  currentPodiumTextureType,
  setCurrentPodiumTextureType,
  onTextureUpload, // Callback for when a texture is selected
  onResetPodiumTexture, // Callback to reset texture
}) {
  const defaultPos = defaultCarPosition || { x: 0, y: 5, z: -52 }; // Fallback defaults

  const [carTransformValues, setCarTransformLeva] = useControls(
    "Car Transform",
    () => ({
      posX: {
        value: defaultPos.x,
        min: -15,
        max: 15,
        step: 0.1,
        onChange: (v) => {
          if (carContainerRef.current) carContainerRef.current.position.x = v;
        },
      },
      posY: {
        value: defaultPos.y,
        min: defaultPos.y - 5,
        max: defaultPos.y + 5,
        step: 0.1,
        onChange: (v) => {
          if (carContainerRef.current) carContainerRef.current.position.y = v;
        },
      },
      posZ: {
        value: defaultPos.z,
        min: -70,
        max: 15,
        step: 0.1, // Allow moving forward from -52
        onChange: (v) => {
          if (carContainerRef.current) carContainerRef.current.position.z = v;
        },
      },
      rotX: {
        value: 0,
        min: -180,
        max: 180,
        step: 1,
        onChange: (v) => {
          if (carContainerRef.current)
            carContainerRef.current.rotation.x = THREE.MathUtils.degToRad(v);
        },
      },
      rotY: {
        value: 0,
        min: -180,
        max: 180,
        step: 1, // Car initially rotated PI by Y, so this is relative to that
        onChange: (v) => {
          if (carContainerRef.current)
            carContainerRef.current.rotation.y = THREE.MathUtils.degToRad(v);
        },
      },
      rotZ: {
        value: 0,
        min: -180,
        max: 180,
        step: 1,
        onChange: (v) => {
          if (carContainerRef.current)
            carContainerRef.current.rotation.z = THREE.MathUtils.degToRad(v);
        },
      },
      autoRotate: {
        value: autoRotateState.enabled,
        onChange: (v) =>
          setAutoRotateState((prev) => ({ ...prev, enabled: v })),
      },
      autoRotateSpeed: {
        value: autoRotateState.speed,
        min: 0.1,
        max: 3.0,
        step: 0.1,
        onChange: (v) => setAutoRotateState((prev) => ({ ...prev, speed: v })),
      },
      resetCar: button(() => {
        if (carContainerRef.current) {
          carContainerRef.current.position.set(
            defaultPos.x,
            defaultPos.y,
            defaultPos.z
          );
          carContainerRef.current.rotation.set(0, 0, 0);
          setCarTransformLeva({
            posX: defaultPos.x,
            posY: defaultPos.y,
            posZ: defaultPos.z,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
          });
        }
      }),
    }),
    [
      carContainerRef,
      defaultCarPosition,
      autoRotateState.enabled,
      autoRotateState.speed,
    ] // Dependencies
  );

  useControls("Podium Texture", {
    textureType: {
      value: currentPodiumTextureType,
      options: ["Default", "Custom Upload"],
      onChange: (v) => {
        setCurrentPodiumTextureType(v);
        if (v === "Default" && onResetPodiumTexture) {
          onResetPodiumTexture();
        }
      },
    },
    uploadTextureFile: button(
      () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
              if (onTextureUpload)
                onTextureUpload(event.target.result, file.name); // Pass imageUrl
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
      // Conditional rendering of the button is tricky directly in schema,
      // better to always show or handle via Leva's `folder` visibility if needed.
      // For simplicity, always show and let user click.
      // { render: (get) => get("Podium Texture.textureType") === "Custom Upload" }
    ),
  });

  return <Leva collapsed />;
}
