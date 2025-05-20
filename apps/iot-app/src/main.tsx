import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AuthProvider } from "./authentication/context/AuthContext.tsx";
import { PatientUpdateProvider } from "./context/PatientUpdateContext";
import { ThemeProvider } from "./functions/ThemeContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PatientUpdateProvider>
          <App />
        </PatientUpdateProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
