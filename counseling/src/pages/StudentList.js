import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit2, Trash2, X, Search, Loader2, Users, ChevronDown, PlusCircle } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch students and counselors on component mount
  useEffect(() => {
    fetchStudents();
    fetchCounselors();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/counselors');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      toast.error('Failed to load counselors.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://localhost:8080/api/students/${id}`);
        setStudents((prev) => prev.filter((s) => s.id !== id));
        toast.success('Student deleted successfully! ');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete student.');
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
    if (!editStudent) return;

    try {
      const payload = {
        ...editStudent,
        yearLevel: parseInt(editStudent.yearLevel, 10),
        counselor: editStudent.counselorId
          ? { id: editStudent.counselorId }
          : null,
      };

      await axios.put(`http://localhost:8080/api/students/${editStudent.id}`, payload);
      toast.success('Student updated successfully! ');
      setEditStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update student.');
    }
  };

  // Get unique departments for the filter dropdown
  const uniqueDepartments = [...new Set(students.map(student => student.department))].filter(Boolean);

  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === '' || student.department === selectedDepartment;

    return matchesSearchTerm && matchesDepartment;
  });

  // New function to handle the Add Student button click
  const handleAssignCounselor = async () => {
  if (!selectedDepartment) {
    toast.warning('Please select a department before assigning counselors.');
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:8080/api/students/assign/department/${selectedDepartment}`
    );

    toast.success(response.data || 'Students successfully assigned!');
    fetchStudents(); // refresh list after assignment
  } catch (error) {
    console.error('Assign failed:', error);
    toast.error('Failed to assign students.');
  }
};


  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-3xl font-bold text-gray-900">Students</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex-grow sm:flex-grow-0">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-md border-gray-300 pr-10 pl-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors bg-white appearance-none"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            {/* New Add Student Button */}
            <button
              onClick={handleAssignCounselor}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Assign Counselor
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-500">Add new students or adjust your search and filters to find records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counselor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.yearLevel || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.counselor?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium space-x-3 whitespace-nowrap">
                      <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit Student">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Student">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100 opacity-100">
            <div className="bg-indigo-600 text-white p-5 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Student Details</h3>
              <button type="button" onClick={() => setEditStudent(null)} className="text-white hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" name="studentId" value={editStudent.studentId || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Student ID" required />
              <input type="text" name="name" value={editStudent.name || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Name" required />
              <input type="email" name="email" value={editStudent.email || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Email" required />
              <input type="text" name="phone" value={editStudent.phone || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Phone" />
              <input type="text" name="department" value={editStudent.department || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Department" />
              <input type="number" name="yearLevel" value={editStudent.yearLevel || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Year Level" />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Counselor</label>
                <select name="counselorId" value={editStudent.counselorId || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white">
                  <option value="">-- Select Counselor --</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
              <button type="button" onClick={() => setEditStudent(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentList;