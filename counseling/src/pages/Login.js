import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );

      const data = response.data;
      console.log("Response from backend:", data);

      // Expecting data = { role: "counselor", user: { ... } }
      const userRole = data.role?.toUpperCase(); // Normalize to uppercase
      const userInfo = data.user;

      if (userRole && userInfo) {
        // Update user state in App
        onLogin({ ...userInfo, role: userRole });

        toast.success(`Welcome, ${userRole}`, { position: "top-center" });

        // Redirect to the role-specific dashboard
        navigate(`/dashboard/${userRole.toLowerCase()}`);
      } else {
        setError(
          `Login failed: invalid user data. Received: ${JSON.stringify(data)}`
        );
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
        console.error("Backend error:", err.response.data);
      } else {
        setError("Login failed: network or server error");
        console.error("Error:", err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Login
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

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
            className="text-indigo-600 hover:underline mt-2 cursor-pointer"
          >
            Forgot password? Change Password
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
