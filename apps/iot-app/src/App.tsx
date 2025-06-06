import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./authentication/ProtectedRoute";
import HomePage from "./components/MainPageComponent/HomePage";
import RoomDetailComponent from "./components/RoomsComponent/RoomDetailComponent";
import { PatientModalProvider } from "./context/PatientModalContext";
import PatientModals from "./modals/PatientModals";
import AlertArchivePage from "./pages/AlertArchivePage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

// Future flags are configured globally in index.html via window.__reactRouterFutureFlags

function App() {
  return (
    <BrowserRouter>
      <PatientModalProvider>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainPage />}>
              <Route index element={<HomePage />} />
              <Route path="room-detail/:roomNumber" element={<RoomDetailComponent />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="archive" element={<AlertArchivePage />} />
              <Route path="archive/alerts" element={<AlertArchivePage />} />
              <Route path="archive/patients" element={<AlertArchivePage />} />
            </Route>
          </Route>
        </Routes>
        <PatientModals />
      </PatientModalProvider>
    </BrowserRouter>
  );
}

export default App;
