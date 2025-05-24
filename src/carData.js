// src/carData.js
// Paths are relative to the public folder.
// Scales will need significant adjustment for R3F. These are placeholders.

export const CAR_LIST = [
  {
    id: "asparkOwl",
    originalName: "AsparkOwl",
    displayName: "Aspark Owl",
    path: "/mclaren/aspark_owl_2020__www.vecarz.com/scene.gltf",
    showroomScale: [30, 30, 30], // Adjust this!
    showroomPosition: [400, 0, 0], // Example, like your Car2
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this!
  },
  {
    id: "bugattiBolide",
    originalName: "BugattiBolide",
    displayName: "Bugatti Bolide",
    path: "/mclaren/bugatti_bolide_2024__www.vecarz.com/scene.gltf",
    showroomScale: [30, 30, 30], // Adjust this!
    showroomPosition: [-400, 0, 0], // Example position
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this!
  },
  {
    id: "gumpertApollo",
    originalName: "Gumpert Apollo 2019",
    displayName: "Gumpert Apollo 2019",
    path: "/mclaren/custom_apollo_project_evo_2022/scene.gltf",
    // Original scale was 14000. This will need a lot of tuning.
    showroomScale: [30, 30, 30], // Adjust this drastically!
    showroomPosition: [0, 0, -400], // Example position
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this drastically!
  },
  {
    id: "astonMartinVulCan",
    originalName: "AstonMartinVulcan",
    displayName: "Aston Martin Vulcan",
    path: "mclaren/aston_martin_vulcan/scene.gltf",
    // Original scale was 14000. This will need a lot of tuning.
    showroomScale: [30, 30, 30], // Adjust this drastically!
    showroomPosition: [0, 0, 400], // Example position
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this drastically!
  },
];
