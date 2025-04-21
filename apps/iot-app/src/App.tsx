import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import HomePage from "./components/MainPageComponent/HomePage";
import PatientDetail from "./components/PatientDetailComponent/PatientDetailComponent";
import MainPage from "./pages/MainPage/MainPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<HomePage />} />
          <Route path="patient-detail/:id" element={<PatientDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
