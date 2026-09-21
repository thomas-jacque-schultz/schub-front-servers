import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AppThemeProvider } from "./design-system";
import "./i18n";
import { AuthStoreProvider } from "./stores/authStore";
import { ServersStoreProvider } from "./stores/serversStore";
import { PortForwardingStoreProvider } from "./stores/portForwardingStore";
import { ProfileStoreProvider } from "./stores/profileStore";

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
