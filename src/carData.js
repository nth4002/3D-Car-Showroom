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
    showroomPosition: [800, 0, 0], // Example, like your Car2
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this!
  },
  {
    id: "bugattiBolide",
    originalName: "BugattiBolide",
    displayName: "Bugatti Bolide",
    path: "/mclaren/bugatti_bolide_2024__www.vecarz.com/scene.gltf",
    showroomScale: [30, 30, 30], // Adjust this!
    showroomPosition: [-800, 0, 0], // Example position
    showroomRotationY: Math.PI,
    podiumScale: [0.6, 0.6, 0.6], // Adjust this!
  },
  {
    id: "ferrariMonza",
    originalName: "FerrariMonzaSP1",
    displayName: "Ferrari Monza SP1",
    path: "/mclaren/ferrari_monza_sp1_2019__www.vecarz.com/scene.gltf",
    // Original scale was 14000. This will need a lot of tuning.
    showroomScale: [30, 30, 30], // Adjust this drastically!
    showroomPosition: [0, 0, -800], // Example position
    showroomRotationY: Math.PI,
    podiumScale: [35, 35, 35], // Adjust this drastically!
  },
  // { // The McLaren from main.js had separate wheels.
  //   // For simplicity with useGLTF, it's best if the GLTF includes wheels.
  //   // If not, you'd need a more complex Car component to load chassis and wheels separately.
  //   id: 'mclarenDraco',
  //   originalName: "MclarenDraco",
  //   displayName: 'McLaren',
  //   path: '/mclaren/draco/chassis.gltf',
  //   showroomScale: [0.4, 0.4, 0.4], // Adjust!
  //   showroomPosition: [0, 0, 0],    // Example position
  //   showroomRotationY: Math.PI,
  //   podiumScale: [0.6, 0.6, 0.6],   // Adjust!
  // }
];
