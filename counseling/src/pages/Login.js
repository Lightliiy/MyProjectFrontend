import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );

      const data = response.data;
      const userRole = data.role?.toUpperCase();
      const userInfo = data.user;

      if (userRole && userInfo) {
        onLogin({ ...userInfo, role: userRole });
        localStorage.setItem("counselorEmail", userInfo.email);

        // Delay navigation by 1.5 seconds so the toast can be seen
        setTimeout(() => {
          navigate(`/dashboard/${userRole.toLowerCase()}`);
        }, 1700);
      } else {
        toast.error(`Login failed: user is not authorized`, {
          position: "top-right",
        });
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed";
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-200 to-purple-200">
      {/* ToastContainer with explicit position */}
      <ToastContainer position="top-right" newestOnTop />

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4202/4202843.png"
            alt="Login Icon"
            className="w-16 h-16 mx-auto mb-2 animate-float"
          />
          <h2 className="text-2xl font-bold text-indigo-700">Login</h2>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p
            onClick={() => navigate("/change-password")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Forgot password? Change Password
          </p>
          <p
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-indigo-500 mt-2 cursor-pointer"
          >
            ← Back to Home
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Login;
