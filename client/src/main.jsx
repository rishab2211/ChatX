import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "@/components/ui/sonner";
import {SocketProvider} from "./socketContext/SocketContext.jsx";
// Creating root for rendering React app
createRoot(document.getElementById("root")).render(
  <>
    <SocketProvider>
      <App />
      {/* Toast notification */}
      < Toaster closeButton />
    </SocketProvider>
  </>
);
