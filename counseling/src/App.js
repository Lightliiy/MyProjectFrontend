import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AdminDash from "./Dashboard/AdminDash";
import Counselordash from "./Dashboard/Counselordash";
import HODDash from "./Dashboard/HODDash";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

// Protected Route Component
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
  const [user, setUser] = useState(null); // user = { name, role, etc. }

  const handleLogin = (userData) => {
    setUser(userData); // Expected: { name, email, role }
    toast.success("Successfully logged in!");  // Trigger success toast on login
  };

  const handleLogout = () => {
    setUser(null);
    toast.info("You have logged out!");  // Trigger info toast on logout
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/change-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<div className="text-center mt-20 text-red-600">Unauthorized Access</div>} />

        {/* Role-based Dashboards */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={["ADMIN"]}>
              <AdminDash user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/counselor"
          element={
            <ProtectedRoute user={user} allowedRoles={["COUNSELOR"]}>
              <Counselordash user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hod"
          element={
            <ProtectedRoute user={user} allowedRoles={["HOD"]}>
              <HODDash user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
      
    </div>
  );
}

export default App;
