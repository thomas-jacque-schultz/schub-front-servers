import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import {
  AppThemeProvider,
  AuthStoreProvider,
  ProfileStoreProvider,
} from "../common";
import { ServersStoreProvider } from "./stores/serversStore";
import { PortForwardingStoreProvider } from "./stores/portForwardingStore";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <AuthStoreProvider>
          <ProfileStoreProvider>
            <ServersStoreProvider>
              <PortForwardingStoreProvider>
                <App />
              </PortForwardingStoreProvider>
            </ServersStoreProvider>
          </ProfileStoreProvider>
        </AuthStoreProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>,
);
