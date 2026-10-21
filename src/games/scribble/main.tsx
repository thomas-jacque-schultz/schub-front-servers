import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../commun/styles.css";
import { ScribbleApp } from "./ScribbleApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ScribbleApp />
  </StrictMode>,
);
