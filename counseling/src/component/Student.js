import React, { useEffect, useState } from "react";
import axios from "axios";

function Student() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    studentId: "",
    name: "",
    department: "",
    yearLevel: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setErrorMessage("Failed to load students.");
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/students/delete/${student.id}`);
      setMessage("Student deleted successfully.");
      setErrorMessage("");
      fetchStudents();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting student:", err);
      setErrorMessage("Failed to delete student.");
    }
  };

  const handleView = (student) => {
    setViewStudent(student);
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setEditFormData({
      studentId: student.studentId || "",
      name: student.name || "",
      department: student.department || "",
      yearLevel: student.yearLevel || "",
      email: student.email || "",
      phone: student.phone || "",
      profileImage: student.profileImage || "",
    });
    setErrorMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "yearLevel" ? (value === "" ? "" : parseInt(value)) : value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStudent) return;

    try {
      await axios.put(`http://localhost:8080/api/students/update/${editStudent.id}`, editFormData);
      setMessage("Student updated successfully.");
      setErrorMessage("");
      setEditStudent(null);
      fetchStudents();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating student:", err);
      setErrorMessage("Failed to update student.");
    }
  };

  const closeViewModal = () => setViewStudent(null);
  const closeEditModal = () => setEditStudent(null);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Student List</h1>

      {message && (
        <div className="mb-4 px-4 py-3 bg-green-100 text-green-800 rounded shadow-sm">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 px-4 py-3 bg-red-100 text-red-800 rounded shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="overflow-auto max-h-[80vh] border rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">Student ID</th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="border-b border-gray-300 text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  No students available.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
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
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition"
                    >
                      Delete
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
            <p><strong>Student ID:</strong> {viewStudent.studentId}</p>
            <p><strong>Name:</strong> {viewStudent.name}</p>
            <p><strong>Email:</strong> {viewStudent.email}</p>
            <p><strong>Department:</strong> {viewStudent.department}</p>
            <p><strong>Year Level:</strong> {viewStudent.yearLevel}</p>
            <p><strong>Phone:</strong> {viewStudent.phone}</p>
            {viewStudent.profileImage && (
              <p><strong>Profile Image:</strong><br />
                <img src={viewStudent.profileImage} alt="Profile" className="w-24 h-24 rounded mt-2" />
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

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleEditSubmit}>
              {[  
                { name: "studentId", label: "Student ID", type: "text", disabled: true },
                { name: "name", label: "Name", type: "text" },
                { name: "department", label: "Department", type: "text" },
                { name: "yearLevel", label: "Year Level", type: "number" },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone", type: "text" },
                { name: "profileImage", label: "Profile Image URL", type: "text" },
              ].map(({ name, label, type, disabled }) => (
                <div className="mb-4" key={name}>
                  <label className="block mb-1 font-semibold">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={editFormData[name]}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required={name !== "profileImage"}
                    disabled={disabled || false}
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;
