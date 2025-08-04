import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [counselors, setCounselors] = useState([]); // store counselors list
  const [searchTerm, setSearchTerm] = useState('');
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchCounselors();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchCounselors = async () => {
    try {
      // Adjust URL to your backend endpoint that returns counselors
      const response = await axios.get('http://localhost:8080/api/counselors');
      setCounselors(response.data); // assuming [{id, name}, ...]
    } catch (error) {
      console.error('Error fetching counselors:', error);
      toast.error('Failed to load counselors');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:8080/api/students/${id}`);
        setStudents((prev) => prev.filter((s) => s.id !== id));
        toast.success('Student deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleEdit = (student) => {
    setEditStudent({
      ...student,
      counselorId: student.counselor?.id || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...editStudent,
        yearLevel: parseInt(editStudent.yearLevel, 10),
        counselor: editStudent.counselorId
          ? { id: editStudent.counselorId }
          : null,
      };
      delete payload.counselorName; // just in case
      delete payload.counselorId;

      await axios.put(`http://localhost:8080/api/students/${editStudent.id}`, payload);
      toast.success('Student updated successfully');
      setEditStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update student');
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Registered Students
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No students found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b">Student ID</th>
                <th className="px-4 py-3 border-b">Name</th>
                <th className="px-4 py-3 border-b">Email</th>
                <th className="px-4 py-3 border-b">Phone</th>
                <th className="px-4 py-3 border-b">Department</th>
                <th className="px-4 py-3 border-b">Year</th>
                <th className="px-4 py-3 border-b">Counselor</th>
                <th className="px-4 py-3 border-b">Profile</th>
                <th className="px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{student.studentId || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.name || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.email || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.phone || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.department || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.yearLevel || '-'}</td>
                  <td className="px-4 py-2 border-b">{student.counselor?.name || 'N/A'}</td>
                  <td className="px-4 py-2 border-b">
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      'Null'
                    )}
                  </td>
                  <td className="px-4 py-2 border-b space-x-1">
                    <button
                      onClick={() => handleEdit(student)}
                      className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                      style={{ minWidth: '40px' }}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      style={{ minWidth: '40px' }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Edit Student</h3>
            <input
              type="text"
              name="studentId"
              value={editStudent.studentId || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Student ID"
              required
            />
            <input
              type="text"
              name="name"
              value={editStudent.name || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Name"
              required
            />
            <input
              type="email"
              name="email"
              value={editStudent.email || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Email"
              required
            />
            <input
              type="text"
              name="phone"
              value={editStudent.phone || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Phone"
            />
            <input
              type="text"
              name="department"
              value={editStudent.department || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Department"
            />
            <input
              type="number"
              name="yearLevel"
              value={editStudent.yearLevel || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
              placeholder="Year Level"
            />
            {/* Counselor dropdown */}
            <select
              name="counselorId"
              value={editStudent.counselorId || ''}
              onChange={handleEditChange}
              className="w-full mb-3 border rounded px-3 py-2"
            >
              <option value="">-- Select Counselor --</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditStudent(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentList;
