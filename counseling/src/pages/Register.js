import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", 
    employeeId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        roles: [formData.role], 
      };

      const response = await axios.post(
        "http://localhost:8080/api/auth/register-staff",
        payload
      );

      if (response.status === 200) {
        toast.success("Registration successful!", { position: "top-right" });

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "admin",
          employeeId: "",
        });
      } else {
        toast.error("Registration failed!", { position: "top-right" });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during registration.",
        { position: "top-right" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-black-700">Register Admin or HOD</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID</label>
          <input
            type="text"
            name="employeeId"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="admin">Admin</option>
            <option value="hod">HOD</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Register;
