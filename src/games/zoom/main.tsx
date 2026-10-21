import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../commun/styles.css";
import { ZoomApp } from "./ZoomApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ZoomApp />
  </StrictMode>,
);
