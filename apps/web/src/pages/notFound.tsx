/**
 * src/pages/NotFound.tsx
 *
 * Renders a 404 page when no route matches.
 */

import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold mb-2">404</h1>
    <p className="mb-4">Page not found.</p>
    <Link to="/dashboard" className="text-blue-500 hover:underline">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
