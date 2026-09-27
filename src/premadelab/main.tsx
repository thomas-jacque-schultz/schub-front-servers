import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  AppThemeProvider,
  AuthStoreProvider,
  ProfileStoreProvider,
} from "../common";
import App from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppThemeProvider brand="premadelab">
      <BrowserRouter>
        <AuthStoreProvider>
          <ProfileStoreProvider>
            <App />
          </ProfileStoreProvider>
        </AuthStoreProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
);
