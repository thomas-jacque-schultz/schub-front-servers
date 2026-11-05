import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MesureApp } from "./MesureApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <MesureApp />
  </StrictMode>,
);
