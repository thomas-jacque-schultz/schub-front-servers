import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IndicesApp } from "./IndicesApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <IndicesApp />
  </StrictMode>,
);
