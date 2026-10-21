import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ImposteurApp } from "./ImposteurApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ImposteurApp />
  </StrictMode>,
);
