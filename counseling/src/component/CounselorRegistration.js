import React, { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

// This component provides a sleek and modern form for registering a new counselor.
// The design uses a clean card layout with smooth transitions and clear user feedback.
function CounselorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    maxCaseload: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register-counselor",
        formData
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Counselor registered successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          maxCaseload: "",
          department: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
        "Error registering counselor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    // Main container with a subtle background color
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Link to the react-toastify CSS stylesheet from a CDN to fix the import error. */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/react-toastify@9.1.1/dist/ReactToastify.min.css" />

      {/* Toast notifications container */}
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        
        {/* Header section with an icon and title */}
        <div className="flex items-center space-x-6 mb-8 border-b pb-6">
          <div className="p-4 bg-indigo-50 rounded-full">
            <UserPlus className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Register New Counselor</h2>
            <p className="text-gray-500 mt-1">Fill out the form below to add a new counseling professional.</p>
          </div>
        </div>

        {/* The registration form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-full shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-full shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>
            
            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-full shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Max Caseload Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Max Caseload
              </label>
              <input
                type="number"
                name="maxCaseload"
                value={formData.maxCaseload}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-full shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Department Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-full shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              />
            </div>

          </div>

          {/* Submit button with loading state */}
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white shadow-lg transition-colors
                ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register Counselor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CounselorRegistration;
