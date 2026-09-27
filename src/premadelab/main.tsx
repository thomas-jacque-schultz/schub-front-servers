import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  AppThemeProvider,
  AuthStoreProvider,
  ProductProvider,
  ProfileStoreProvider,
} from "../common";
import App from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppThemeProvider brand="premadelab">
      <ProductProvider name="PremadeLab">
        <BrowserRouter>
          <AuthStoreProvider>
            <ProfileStoreProvider>
              <App />
            </ProfileStoreProvider>
          </AuthStoreProvider>
        </BrowserRouter>
      </ProductProvider>
    </AppThemeProvider>
  </StrictMode>,
);
