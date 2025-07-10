import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, X, Loader2 } from 'lucide-react';

function CounselorList() {
  const [counselors, setCounselors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    maxCaseload: '',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [students, setStudents] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/counselors');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setMessage('Error fetching counselors');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (counselor) => {
    setEditingId(counselor.id);
    setEditFormData({
      name: counselor.name,
      email: counselor.email,
      maxCaseload: counselor.maxCaseload,
      department: counselor.department
    });
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this counselor?');
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/counselors/delete/${id}`);
      setMessage('Counselor deleted successfully.');
      fetchCounselors();
    } catch (error) {
      console.error('Error deleting counselor:', error);
      setMessage('Error deleting counselor.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/counselors/update/${id}`, editFormData);
      setEditingId(null);
      setMessage('Counselor updated successfully.');
      fetchCounselors();
    } catch (error) {
      console.error('Error updating counselor:', error);
      setMessage('Error updating counselor.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (counselor) => {
    setSelectedCounselor(counselor);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/students/by-counselor-id/${counselor.id}`);
      setStudents(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Error loading students.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCounselors = counselors.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-10 max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Registered Counselors
      </h3>

      {message && (
        <div className="mb-4 text-center text-sm text-white bg-blue-500 rounded p-2">
          {message}
          <button className="ml-2 text-white hover:text-gray-200" onClick={() => setMessage('')}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Max Caseload</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCounselors.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No counselors found.
                </td>
              </tr>
            ) : (
              filteredCounselors.map((counselor) => (
                <tr key={counselor.id} className="hover:bg-gray-50">
                  {editingId === counselor.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name="maxCaseload"
                          value={editFormData.maxCaseload}
                          onChange={handleEditChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="department"
                          value={editFormData.department}
                          onChange={handleEditChange}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleUpdate(counselor.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{counselor.name}</td>
                      <td className="px-4 py-3">{counselor.email}</td>
                      <td className="px-4 py-3">{counselor.maxCaseload}</td>
                      <td className="px-4 py-3">{counselor.department}</td>
                      <td className="px-4 py-3 text-center space-x-3">
                        <button
                          onClick={() => handleViewClick(counselor)}
                          className="text-green-600 hover:text-green-800 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(counselor)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(counselor.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal to Show Assigned Students */}
      {showDetails && selectedCounselor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Assigned Students</h2>
            {students.length > 0 ? (
              <ul className="list-disc ml-5 space-y-2">
                {students.map((student) => (
                  <li key={student.id}>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No students assigned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CounselorList;
