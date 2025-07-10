import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setErrorMessage("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setErrorMessage("");
    toast.success("Password reset successful!", { position: "top-center" });
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Reset Password
        </h2>
        {errorMessage && (
          <p className="text-red-600 mb-4 text-center font-medium">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md shadow-md transition"
          >
            Reset Password
          </button>
        </form>
        <div className="text-center mt-6">
          <p
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium transition"
          >
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
