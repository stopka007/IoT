import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import MainPage from "./pages/MainPage/MainPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainPage />
  </StrictMode>,
);
