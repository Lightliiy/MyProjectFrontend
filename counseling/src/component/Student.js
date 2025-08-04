import React, { useEffect, useState } from "react";
import axios from "axios";

function Student({ counselorId }) {
  const [students, setStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  // Log counselorId and fetch students when it changes
  useEffect(() => {
    console.log("Student component: counselorId changed to:", counselorId);
    if (counselorId) {
      fetchAssignedStudents();
    } else {
      // Clear students if counselorId is missing or null
      setStudents([]);
      setErrorMessage("No counselorId provided");
    }
  }, [counselorId]);

  const fetchAssignedStudents = async () => {
    try {
      console.log("Fetching assigned students for counselorId:", counselorId);
      const res = await axios.get(
        `http://localhost:8080/api/students/by-counselor-id/${counselorId}`
      );
      console.log("Fetched assigned students:", res.data);
      setStudents(res.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch assigned students", error);
      setErrorMessage("Failed to load assigned students.");
      setStudents([]);
    }
  };

  const handleView = (student) => {
    setViewStudent(student);
  };

  const closeViewModal = () => setViewStudent(null);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Assigned Students</h1>

      {errorMessage && (
        <div className="mb-4 px-4 py-3 bg-red-100 text-red-800 rounded shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="overflow-auto max-h-[80vh] border rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Student ID
              </th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  No assigned students available.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm">{s.studentId}</td>
                  <td className="px-4 py-3 text-sm">{s.name}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleView(s)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Student Details</h2>
            <p>
              <strong>Student ID:</strong> {viewStudent.studentId}
            </p>
            <p>
              <strong>Name:</strong> {viewStudent.name}
            </p>
            <p>
              <strong>Email:</strong> {viewStudent.email}
            </p>
            <p>
              <strong>Department:</strong> {viewStudent.department}
            </p>
            <p>
              <strong>Year Level:</strong> {viewStudent.yearLevel}
            </p>
            <p>
              <strong>Phone:</strong> {viewStudent.phone}
            </p>
            {viewStudent.profileImage && (
              <p>
                <strong>Profile Image:</strong>
                <br />
                <img
                  src={viewStudent.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded mt-2"
                />
              </p>
            )}
            <button
              onClick={closeViewModal}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
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
