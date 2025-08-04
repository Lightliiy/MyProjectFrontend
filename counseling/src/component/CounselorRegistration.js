import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CounselorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // make sure this is raw password, NOT hashed
    maxCaseload: "",
    department: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional: Validate password length or strength here

    try {
      const response = await axios.post(
        "http://localhost:8080/api/counselors/add",
        formData
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Counselor registered successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Clear form fields after success
        setFormData({
          name: "",
          email: "",
          password: "",
          maxCaseload: "",
          department: "",
        });
      }
    } catch (error) {
      // Show server error message or a generic message
      toast.error(
        error.response?.data?.message ||
          "Error registering counselor. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-indigo-100 rounded-full">
            <UserPlus className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Register New Counselor</h2>
            <p className="text-gray-600">Add a new counselor</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Caseload
              </label>
              <input
                type="number"
                name="maxCaseload"
                value={formData.maxCaseload}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Register Counselor
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CounselorRegistration;
