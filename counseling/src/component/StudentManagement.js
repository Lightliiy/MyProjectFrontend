import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    studentId: '',
    counselorId: '',
    status: 'Active',
  });

  const departments = ['Computing', 'Science'];

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = () => {
    axios
      .get('http://localhost:8080/api/counselors')
      .then((response) => {
        const fetchedCounselors = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.counselors)
          ? response.data.counselors
          : [];
        setCounselors(fetchedCounselors);
      })
      .catch((error) => {
        console.error('Error fetching counselors:', error);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      studentId: formData.studentId,
      status: formData.status,
      counselor: {
        id: formData.counselorId,
      },
    };

    axios
      .post('http://localhost:8080/api/students/register', payload)
      .then((response) => {
        setStudents((prev) => [...prev, response.data]);
        setFormData({
          name: '',
          email: '',
          department: '',
          studentId: '',
          counselorId: '',
          status: 'Active',
        });
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Add New Student
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Counselor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Counselor
              </label>
              <select
                name="counselorId"
                value={formData.counselorId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Counselor</option>
                {counselors.length === 0 ? (
                  <option disabled>Loading counselors...</option>
                ) : (
                  counselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentManagement;
