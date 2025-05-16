/**
 * src/App.tsx
 *
 * Main application component that sets up routing.
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Callback from "./pages/callback";
import Download from "./pages/download";
import NotFound from "./pages/notFound";
import Dashboard from "./pages/dashboard";


const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/download" element={<Download />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
