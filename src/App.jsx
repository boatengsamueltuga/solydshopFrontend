import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (

    <div>

      <Navbar />

      <Routes>

        {/* <Route path="/" element={<HomePage />} /> */}
        <Route
         path="/"
         element={
        <ProtectedRoute>
            <HomePage />
        </ProtectedRoute>
    }
/>

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

      </Routes>

    </div>
  );
}

export default App;