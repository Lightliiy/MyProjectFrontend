import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import your other components here
import CounselorList from "../component/CounselorList";
import RegisteredStudent from "../component/RegisteredStudent";
import StudentList from "../pages/StudentList";
import AdminPanel from "../component/AdminPanel";

function Sidebar({ isOpen, activePage, setActivePage }) {
  const menuItems = [
    { label: "Dashboard", id: "dashboard" },
    { label: "Register Student", id: "register" },
    { label: "Counselor List", id: "counselors" },
    { label: "Student List", id: "registeredlist" },
    { label: "Admin Panel", id: "admin" },
  ];

  return (
    <aside
      className={`bg-indigo-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 flex items-center justify-center h-16 border-b border-indigo-700">
        <span className={`font-bold text-xl ${!isOpen && "hidden"}`}>
          Admin Panel
        </span>
        <svg
          className={`h-6 w-6 ${isOpen && "hidden"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${
                    activePage === item.id
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-indigo-800"
                  }`}
              >
                <span className={!isOpen ? "hidden" : ""}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function Header({ toggleSidebar, onLogout }) {
  return (
    <header className="bg-white shadow fixed top-0 right-0 left-0 h-16 z-10">
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle Sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-red-600 font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalCounselors: 0,
    escalatedToAdminCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/hod/summary-counts"
        );
        setCounts(response.data);
      } catch (error) {
        console.error("Failed to fetch summary counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  if (loading) return <div>Loading dashboard data...</div>;

  return (
    <section className="p-6 bg-white rounded shadow-md max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-indigo-900">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-3 gap-6 text-gray-700">
        <div className="p-4 bg-indigo-50 rounded text-center">
          <h2 className="text-lg font-medium mb-2">Number of Student</h2>
          <p className="text-4xl font-bold text-indigo-700">{counts.totalStudents}</p>
        </div>
        <div className="p-4 bg-green-50 rounded text-center">
          <h2 className="text-lg font-medium mb-2">Number of counselors</h2>
          <p className="text-4xl font-bold text-green-700">{counts.totalCounselors}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded text-center">
          <h2 className="text-lg font-medium mb-2">Escalated to Admin</h2>
          <p className="text-4xl font-bold text-purple-700">{counts.escalatedToAdminCases}</p>
        </div>
      </div>
    </section>
  );
}


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear session/local data on logout
    navigate("/login"); // Redirect to login page
  };

  const pageTitle = {
    dashboard: "Dashboard Overview",
    register: "Register Student",
    counselors: "Counselor List",
    registeredlist: "Student List",
    admin: "HOD Profile",
    settings: "System Settings",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } pt-16 pb-16 p-6`}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{pageTitle[activePage]}</h1>

          {activePage === "dashboard" && <Dashboard />}
          {activePage === "register" && <RegisteredStudent />}
          {activePage === "counselors" && <CounselorList />}
          {activePage === "registeredlist" && <StudentList />}
          {activePage === "admin" && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;
