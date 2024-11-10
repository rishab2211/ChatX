import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "@/components/ui/sonner";

// Creating root for rendering React app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* Toast notification */}
    <Toaster closeButton />
  </StrictMode>
);
