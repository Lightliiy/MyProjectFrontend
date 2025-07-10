import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisteredStudent = () => {
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

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/counselors');
        setCounselors(Array.isArray(res.data) ? res.data : res.data.counselors || []);
      } catch (err) {
        console.error('Error fetching counselors:', err);
        toast.error('Failed to load counselors.');
      }
    };
    fetchCounselors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      ...formData,
      yearLevel: parseInt(formData.yearLevel),
      profileImage: null, // Sent as null, will be set after login
      counselor: formData.counselor ? { id: formData.counselor } : null,
    };

    try {
      await axios.post('http://localhost:8080/api/students/register', studentData);
      toast.success('Student registered successfully.');
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
      toast.error('Registration failed.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register New Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} />
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          <Select label="Department" name="department" value={formData.department} onChange={handleChange} options={departments} />
          <Input label="Year Level" name="yearLevel" type="number" value={formData.yearLevel} onChange={handleChange} />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Select
            label="Counselor"
            name="counselor"
            value={formData.counselor}
            onChange={handleChange}
            options={counselors.map(c => ({ value: c.id, label: c.name }))}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Register Student
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      required
    />
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      required
    >
      <option value="">Select {label}</option>
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

export default RegisteredStudent;
