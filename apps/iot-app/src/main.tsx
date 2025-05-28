import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AuthProvider } from "./authentication/context/AuthContext.tsx";
import { PatientUpdateProvider } from "./context/PatientUpdateContext";
import { ThemeProvider } from "./functions/ThemeContext.tsx";
import "./index.css";

// Add error handler to suppress various console errors
const originalConsoleError = console.error;
console.error = function (...args) {
  // Check if there are any arguments
  if (args.length === 0) return originalConsoleError.apply(console, args);

  // Get the error message if it's a string
  const errorMsg = typeof args[0] === "string" ? args[0] : "";

  // Suppress specific errors
  if (
    // Source map errors
    errorMsg.includes("source map") ||
    // WebSocket connection errors
    errorMsg.includes("WebSocket") ||
    errorMsg.includes("ws://127.0.0.1:1880") ||
    // Firefox WebSocket errors
    (args[0] && args[0].target instanceof WebSocket) ||
    // React Router deprecation warnings (optional)
    errorMsg.includes("Future flag") ||
    errorMsg.includes("startTransition") ||
    errorMsg.includes("relativeSplitPath") ||
    errorMsg.includes("v7_relativeSplitPath")
  ) {
    return; // Suppress these errors
  }

  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

// Also suppress warnings
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  // Check if there are any arguments
  if (args.length === 0) return originalConsoleWarn.apply(console, args);

  // Get the warning message if it's a string
  const warnMsg = typeof args[0] === "string" ? args[0] : "";

  // Suppress specific warnings
  if (
    // React Router deprecation warnings - very specific matching
    warnMsg.includes("Future Flag") ||
    warnMsg.includes("Relative route resolution") ||
    warnMsg.includes("v7_relativeSplitPath") ||
    warnMsg.includes("reactrouter.com/en/v6/upgrading/future")
  ) {
    return; // Suppress these warnings
  }

  // Pass through all other warnings
  originalConsoleWarn.apply(console, args);
};

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
