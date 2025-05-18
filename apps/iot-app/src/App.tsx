import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ProtectedRoute from "./authentication/ProtectedRoute";
import HomePage from "./components/MainPageComponent/HomePage";
import RoomDetailComponent from "./components/RoomsComponent/RoomDetailComponent";
import AlertArchivePage from "./pages/AlertArchivePage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
