import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { appTheme } from "./theme";
import { AuthStoreProvider } from "./stores/authStore";
import { ServersStoreProvider } from "./stores/serversStore";
import { PortForwardingStoreProvider } from "./stores/portForwardingStore";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthStoreProvider>
          <ServersStoreProvider>
            <PortForwardingStoreProvider>
              <App />
            </PortForwardingStoreProvider>
          </ServersStoreProvider>
        </AuthStoreProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
