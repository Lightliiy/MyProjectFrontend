import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

function CasePage() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filtered cases based on filter and search
  const filteredCases = cases.filter((case_) => {
    if (filter !== "all" && case_.status.toLowerCase() !== filter) {
      return false;
    }
    if (search && !case_.student.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {["all", "pending", "escalated"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "escalated"
                      ? "bg-red-100 text-red-700"
                      : "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status === "all"
                  ? "All Cases"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <svg
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Cases Found
            </h3>
            <p className="text-gray-500">
              Cases that match your criteria will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Issue Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.student}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.counselor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.issueType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          case_.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : case_.status === "Escalated"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {case_.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                        View Details
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium">
                        Escalate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CasePage;
