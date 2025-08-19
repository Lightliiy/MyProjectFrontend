import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, ChevronDown } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Reusable Input component with a professional, consistent style
const Input = ({ label, name, value, onChange, type = 'text', required = true }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      required={required}
    />
  </div>
);

// Reusable Select component for dropdowns
const Select = ({ label, name, value, onChange, options, required = true }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white appearance-none"
      required={required}
    >
      <option value="" disabled>Select {label}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
    </div>
  </div>
);

function CounselorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    maxCaseload: "",
    department: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments from the API on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/students');
        const studentList = Array.isArray(res.data) ? res.data : [];
        // Extract and filter unique, non-empty department names
        const uniqueDepartments = [...new Set(studentList.map(student => student.department))].filter(Boolean);
        setDepartments(uniqueDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        toast.error('Failed to load departments.');
      }
    };
    fetchDepartments();
  }, []);

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
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        
        <div className="flex items-center space-x-6 mb-8 border-b pb-6">
          <div className="p-4 bg-indigo-50 rounded-full">
            <UserPlus className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Register New Counselor</h2>
            <p className="text-gray-500 mt-1">Fill out the form below to add a new counseling professional.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            <Input label="Max Caseload" name="maxCaseload" type="number" value={formData.maxCaseload} onChange={handleChange} />

            {/* Department Select dropdown with dynamic options */}
            <div className="md:col-span-2">
              <Select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={departments}
              />
            </div>
          </div>

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