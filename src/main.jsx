import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./App.css";
import "./styles/variables.css";
import "./styles/animations.css";
import "./styles/cake.css";
import "./styles/camera.css";
import "./styles/effects.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
