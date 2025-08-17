import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Reusable Input component with a professional, consistent style
const Input = ({ label, name, value, onChange, type = 'text', required = true }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      required={required}
    />
  </div>
);

// Reusable Select component for dropdowns
const Select = ({ label, name, value, onChange, options, required = true }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
      required={required}
    >
      <option value="" disabled>Select {label}</option>
      {options.map(option =>
        typeof option === 'object' ? (
          <option key={option.value} value={option.value}>{option.label}</option>
        ) : (
          <option key={option} value={option}>{option}</option>
        )
      )}
    </select>
  </div>
);

const RegisteredStudent = () => {
  // Component state for form data
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    yearLevel: '',
    password: '',
    phone: '',
    counselor: '',
  });

  const [counselors, setCounselors] = useState([]);
  const departments = ['Computing', 'Science'];

  // Fetch counselors from the API on component mount
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/counselors');
        const counselorList = Array.isArray(res.data) ? res.data : res.data.counselors || [];
        setCounselors(counselorList);
      } catch (err) {
        console.error('Error fetching counselors:', err);
        toast.error('Failed to load counselors. Please try again later.');
      }
    };
    fetchCounselors();
  }, []);

  // Handler for all form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare student data for API call
    const studentData = {
      ...formData,
      yearLevel: parseInt(formData.yearLevel),
      profileImage: null,
      counselor: formData.counselor ? { id: formData.counselor } : null,
    };

    try {
      await axios.post('http://localhost:8080/api/students/register', studentData);
      toast.success('Student registered successfully!');
      // Reset form to its initial state
      setFormData({
        studentId: '',
        name: '',
        email: '',
        department: '',
        yearLevel: '',
        password: '',
        phone: '',
        counselor: '',
      });
    } catch (err) {
      console.error('Error registering student:', err);
      // Display a specific error message from the API or a generic one
      const errorMessage = err.response?.data?.message || 'Registration failed. Please check the form and try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Header Section */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register New Student
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the student's details to create a new account.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} />
            <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments}
            />
            <Input label="Year Level" name="yearLevel" type="number" value={formData.yearLevel} onChange={handleChange} />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <Select
              label="Assign Counselor"
              name="counselor"
              value={formData.counselor}
              onChange={handleChange}
              options={counselors.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="group relative flex justify-center py-2 px-6 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisteredStudent;