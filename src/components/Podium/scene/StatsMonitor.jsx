// src/components/Podium/scene/StatsMonitor.jsx
import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stats from "three/examples/jsm/libs/stats.module.js";

function StatsMonitor() {
  const { gl, camera } = useThree(); // Get renderer and camera
  const statsRef = useRef(null);
  const containerRef = useRef(null); // Ref for the DOM element to append stats to

  useEffect(() => {
    // Create a div that will contain the stats panel
    // This ensures it's part of React's DOM tree for easier management
    // and can be positioned relative to the canvas or a wrapper.
    const statsContainer = document.createElement("div");
    statsContainer.style.position = "fixed"; // Use 'fixed' or 'absolute' based on desired positioning
    statsContainer.style.top = "10px"; // Example positioning
    statsContainer.style.left = "10px";
    statsContainer.style.zIndex = "1000"; // Ensure it's on top
    document.body.appendChild(statsContainer); // Append to body or a specific wrapper
    containerRef.current = statsContainer;

    statsRef.current = new Stats();
    // statsRef.current.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    containerRef.current.appendChild(statsRef.current.dom);

    return () => {
      // Cleanup: remove stats DOM when component unmounts
      if (
        containerRef.current &&
        statsRef.current &&
        statsRef.current.dom.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(statsRef.current.dom);
      }
      if (
        containerRef.current &&
        containerRef.current.parentNode === document.body
      ) {
        document.body.removeChild(containerRef.current);
      }
      statsRef.current = null; // Clear ref
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  useFrame(() => {
    if (statsRef.current) {
      statsRef.current.update();
    }
  });

  // This component doesn't render any JSX directly into the R3F scene graph.
  // It manipulates the DOM to add the Stats.js panel.
  return null;
}

export default StatsMonitor;
