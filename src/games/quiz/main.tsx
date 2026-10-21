import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QuizApp } from "./QuizApp";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <QuizApp />
  </StrictMode>,
);
