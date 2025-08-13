import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, X, Loader2, Search, Users, Briefcase } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom reusable Modal component for displaying student details
const StudentDetailsModal = ({ counselor, students, onClose, loading }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all scale-100 opacity-100">
      <div className="bg-indigo-600 text-white p-5 rounded-t-xl flex justify-between items-center">
        <h3 className="text-xl font-bold">Students for {counselor.name}</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
          </div>
        ) : students.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {students.map((student) => (
              <li key={student.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="text-sm text-gray-600">Reg: {student.studentId}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No students currently assigned to this counselor.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

function CounselorList() {
  const [counselors, setCounselors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    maxCaseload: '',
    department: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [students, setStudents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      toast.error('Failed to load counselors.');
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
      department: counselor.department,
    });
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this counselor? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:8080/api/counselors/delete/${id}`);
      toast.success('Counselor deleted successfully!');
      fetchCounselors(); // Re-fetch list to show changes
    } catch (error) {
      console.error('Error deleting counselor:', error);
      toast.error('Error deleting counselor.');
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/counselors/update/${id}`, editFormData);
      setEditingId(null);
      toast.success('Counselor updated successfully!');
      fetchCounselors(); // Re-fetch list to show changes
    } catch (error) {
      console.error('Error updating counselor:', error);
      toast.error('Error updating counselor.');
    }
  };

  const handleViewClick = async (counselor) => {
    setSelectedCounselor(counselor);
    setShowDetailsModal(true);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/students/by-counselor-id/${counselor.id}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCounselor(null);
    setStudents([]);
  };

  const filteredCounselors = counselors.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Counselor Management</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        ) : filteredCounselors.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Counselors Found</h3>
            <p className="text-gray-500">Add a new counselor to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caseload</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCounselors.map((counselor) => (
                  <tr key={counselor.id} className="hover:bg-gray-50 transition-colors">
                    {editingId === counselor.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full border rounded-md px-2 py-1" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} className="w-full border rounded-md px-2 py-1" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" name="department" value={editFormData.department} onChange={handleEditChange} className="w-full border rounded-md px-2 py-1" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" name="maxCaseload" value={editFormData.maxCaseload} onChange={handleEditChange} className="w-full border rounded-md px-2 py-1" />
                        </td>
                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                          <button onClick={() => handleUpdate(counselor.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors text-sm font-medium">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{counselor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{counselor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{counselor.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-sm text-gray-700">{counselor.assignedStudentsCount} {counselor.maxCaseload}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium space-x-3 whitespace-nowrap">
                          <button onClick={() => handleViewClick(counselor)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="View Assigned Students">
                            <Users size={18} />
                          </button>
                          <button onClick={() => handleEditClick(counselor)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit Counselor">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(counselor.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Counselor">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetailsModal && selectedCounselor && (
        <StudentDetailsModal
          counselor={selectedCounselor}
          students={students}
          onClose={handleCloseModal}
          loading={loading}
        />
      )}
    </div>
  );
}

export default CounselorList;