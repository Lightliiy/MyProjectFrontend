import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselors, setSelectedCounselors] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/hod/escalated-to-admin")
      .then((res) => setEscalatedCases(res.data))
      .catch((err) =>
        console.error("Error fetching escalated cases", err)
      );

    axios
      .get("http://localhost:8080/api/counselors")
      .then((res) => setCounselors(res.data))
      .catch((err) =>
        console.error("Error fetching counselors", err)
      );
  }, []);

  const handleAssignCounselor = async (caseId) => {
    const counselorId = selectedCounselors[caseId];
    if (!counselorId) {
      alert("Please select a counselor first.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/admin/reassign-counselor", {
        caseId,
        counselorId,
      });

      // Update UI
      setEscalatedCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                counselor: counselors.find((cn) => cn.id === +counselorId),
              }
            : c
        )
      );

      alert("Counselor reassigned successfully");
    } catch (error) {
      console.error("Reassignment failed", error);
      alert("Failed to reassign counselor");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Escalated Cases from HOD</h2>

      {escalatedCases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No escalated cases requiring attention</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Current Counselor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Assign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {escalatedCases.map((case_) => (
                <tr key={case_.id}>
                  <td className="px-6 py-4">{case_.student?.name || "N/A"}</td>
                  <td className="px-6 py-4">{case_.department}</td>
                  <td className="px-6 py-4">
                    {case_.counselor ? case_.counselor.name : "Not Assigned"}
                  </td>
                  <td className="px-6 py-4">{case_.issue}</td>
                  <td className="px-6 py-4">
                    <select
                      value={selectedCounselors[case_.id] || ""}
                      onChange={(e) =>
                        setSelectedCounselors((prev) => ({
                          ...prev,
                          [case_.id]: e.target.value,
                        }))
                      }
                      className="border rounded-lg px-2 py-1"
                    >
                      <option value="" disabled>
                        Select Counselor
                      </option>
                      {counselors.map((cnsl) => (
                        <option key={cnsl.id} value={cnsl.id}>
                          {cnsl.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAssignCounselor(case_.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
