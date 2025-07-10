import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CounselorRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    maxCaseload: '',
    department: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/counselors/add', formData);
      if (response.status === 200) {
        toast.success('Counselor registered successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData({
          name: '',
          email: '',
          maxCaseload: '',
          department: ''
        });
      }
    } catch (error) {
      toast.error('Error registering counselor. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Caseload</label>
              <input
                type="number"
                name="maxCaseload"
                value={formData.maxCaseload}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
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
