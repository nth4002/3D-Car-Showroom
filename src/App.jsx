/**
 * This will render the UI panels and the CanvasWrapper
 */
import React from "react";
import CanvasWrapper from "./components/CanvasWrapper";
import ObjectInfoPanel from "./components/UI/ObjectInfoPanel";
import StartPanel from "./components/UI/StartPanel";
import ControlHints from "./components/UI/ControlHints";
import useAppStore from "./store/useAppStore";
import { Podium } from "./components/Podium/Podium";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import routing components
import "./App.css";

function MainExperience() {
  const showStartPanel = useAppStore((state) => state.showStartPanel);
  const showObjectInfoPanel = useAppStore((state) => state.showObjectInfoPanel);

  return (
    <>
      <CanvasWrapper /> {/* Contains the main showroom Experience */}
      {showStartPanel && <StartPanel />}
      {showObjectInfoPanel && <ObjectInfoPanel />}
      <ControlHints />
    </>
  );
}

function App() {
  const podiumViewActive = useAppStore((state) => state.podiumViewActive);

  return (
    <Router>
      {/* Conditionally render UI elements based on podiumViewActive if needed */}
      {/* For example, you might want to hide ControlHints on the podium screen */}
      <Routes>
        <Route path="/" element={<MainExperience />} />
        <Route path="/podium" element={<Podium />} />
      </Routes>
      {/* Global UI that should appear on all pages (if any) can go here,
          or be managed within MainExperience and Podium individually.
          For now, ControlHints is tied to MainExperience.
      */}
    </Router>
  );
}

export default App;
