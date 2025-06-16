// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS explicitly
import "./index.css"; // Ensure Tailwind CSS is imported after Leaflet

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
