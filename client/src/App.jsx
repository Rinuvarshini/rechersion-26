import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Log from "./pages/Log";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Doctor from "./pages/Doctor";
import Navbar from "./components/Navbar";

// Deploy ku munnadi idhu false ah irukkanum.
const DEV_SKIP_AUTH = false;

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token && !DEV_SKIP_AUTH) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctor/:token" element={<Doctor />} />
        <Route path="/log" element={<RequireAuth><Log /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/" element={<Navigate to="/log" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}