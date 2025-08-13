import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaTimes, FaUser, FaSpinner, FaUsers } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Student({ counselorId }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewStudent, setViewStudent] = useState(null);

  // Fetch students when counselorId changes
  useEffect(() => {
    if (counselorId) {
      fetchAssignedStudents();
    } else {
      setStudents([]);
      setIsLoading(false);
      toast.error("No counselor ID found. Please log in.");
    }
  }, [counselorId]);

  const fetchAssignedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/students/by-counselor-id/${counselorId}`
      );
      setStudents(res.data);
      // Optional: Show a success toast on successful fetch
      // if (res.data.length > 0) {
      //   toast.success("Students loaded successfully.");
      // } else {
      //   toast.info("You have no assigned students yet.");
      // }
    } catch (error) {
      console.error("Failed to fetch assigned students", error);
      toast.error("Failed to load assigned students.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (student) => {
    setViewStudent(student);
  };

  const closeViewModal = () => setViewStudent(null);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center mb-6">
        <FaUsers className="text-4xl text-indigo-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Assigned Students</h1>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-indigo-600">
          <FaSpinner className="animate-spin text-4xl mr-3" />
          <p className="text-xl">Loading students...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500 italic">
                      No assigned students available.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{s.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(s)}
                          className="flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <button
              onClick={closeViewModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <FaTimes className="text-2xl" />
            </button>
            <div className="flex items-center mb-6">
              <FaUser className="text-3xl text-indigo-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {viewStudent.profileImage && (
                <div className="flex-shrink-0">
                  <img
                    src={viewStudent.profileImage}
                    alt={`${viewStudent.name}'s Profile`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                  />
                </div>
              )}
              <div className="text-gray-700">
                <p className="mb-2">
                  <strong className="block text-gray-900">Name:</strong> {viewStudent.name}
                </p>
                <p className="mb-2">
                  <strong className="block text-gray-900">Student ID:</strong> {viewStudent.studentId}
                </p>
                <p className="mb-2">
                  <strong className="block text-gray-900">Email:</strong> {viewStudent.email}
                </p>
                <p className="mb-2">
                  <strong className="block text-gray-900">Department:</strong> {viewStudent.department}
                </p>
                <p className="mb-2">
                  <strong className="block text-gray-900">Year Level:</strong> {viewStudent.yearLevel}
                </p>
                <p>
                  <strong className="block text-gray-900">Phone:</strong> {viewStudent.phone}
                </p>
              </div>
            </div>

            <button
              onClick={closeViewModal}
              className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;