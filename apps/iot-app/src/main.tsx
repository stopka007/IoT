import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "./functions/ThemeContext.tsx";
import "./index.css";
import MainPage from "./pages/MainPage/MainPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MainPage />
    </ThemeProvider>
  </StrictMode>,
);
