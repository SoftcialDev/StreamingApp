/**
 * src/main.tsx
 *
 * Application entry point. Imports global styles and renders the App.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import 'module-alias/register';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
