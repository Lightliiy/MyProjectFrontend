import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import WelcomePage from "./pages/WelcomePage";
import AdminDash from "./Dashboard/AdminDash";
import HODDash from "./Dashboard/HODDash";
import VideoCall from "./Dashboard/VideoCall";
import Counselordash from "./Dashboard/Counselordash";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ProtectedRoute component to handle role-based access
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle login and show toast only once
  const handleLogin = (userData) => {
    toast.dismiss(); // Clear any existing toast
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Successfully logged in!");
    // Redirect based on role
    if (userData.role === "ADMIN") {
      navigate("/dashboard/admin");
    } else if (userData.role === "HOD") {
      navigate("/dashboard/hod");
    } else if (userData.role === "COUNSELOR") {
      navigate("/dashboard/counselor");
    }
  };

  // Handle logout
  const handleLogout = () => {
    toast.dismiss();
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You have logged out.");
    navigate("/login");
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/change-password" element={<ResetPassword />} />
        <Route
          path="/unauthorized"
          element={
            <div className="text-center mt-20 text-red-600 text-xl font-semibold">
              Unauthorized Access
            </div>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={["ADMIN"]}>
              <AdminDash user={user} onLogout={handleLogout} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hod"
          element={
            <ProtectedRoute user={user} allowedRoles={["HOD"]}>
              <HODDash user={user} onLogout={handleLogout} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/counselor"
          element={
            <ProtectedRoute user={user} allowedRoles={["COUNSELOR"]}>
              {/* Correctly pass both user and setUser */}
              <Counselordash user={user} onLogout={handleLogout} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route path="/video-call" element={<VideoCall />} />
      </Routes>
    </div>
  );
}

export default App;