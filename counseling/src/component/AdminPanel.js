import React, { useState } from 'react';

function AdminPanel() {
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [counselors, setCounselors] = useState([]);

  const handleAssignCounselor = (caseId, counselorId) => {
    // Handle counselor reassignment
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Counselor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {escalatedCases.map(case_ => (
                <tr key={case_.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{case_.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{case_.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{case_.currentCounselor}</td>
                  <td className="px-6 py-4">{case_.issue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{case_.requestedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      onChange={(e) => handleAssignCounselor(case_.id, e.target.value)}
                      className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Assign New Counselor</option>
                      {counselors.map(counselor => (
                        <option key={counselor.id} value={counselor.id}>
                          {counselor.name}
                        </option>
                      ))}
                    </select>
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