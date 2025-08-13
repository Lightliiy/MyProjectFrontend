import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  UserPlus,
  Users,
  Briefcase,
  Monitor,
  LogOut,
  User,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import your other components here
import CounselorList from "../component/CounselorList";
import RegisteredStudent from "../component/RegisteredStudent";
import StudentList from "../pages/StudentList";
import AdminPanel from "../component/AdminPanel";
import Register from "../pages/Register";

function Sidebar({ isOpen, toggleSidebar, activePage, setActivePage }) {
  const menuItems = [
    { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { label: "Register Student", id: "register", icon: UserPlus },
    { label: "Counselor List", id: "counselors", icon: Briefcase },
    { label: "Student List", id: "registeredlist", icon: Users },
    { label: "Admin Panel", id: "admin", icon: Monitor },
    { label: "Register User", id: "hodadmin", icon: UserPlus },
  ];

  return (
    <aside
      className={`bg-indigo-800 text-white h-screen fixed left-0 top-0 overflow-hidden transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${!isOpen && "opacity-0 hidden"}`}>
          <Briefcase className="h-7 w-7 text-indigo-300" />
          <span className="font-bold text-xl">Admin Portal</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 
                    ${
                      activePage === item.id
                        ? "bg-indigo-700 text-white shadow-md"
                        : "hover:bg-indigo-700 hover:text-white"
                    }
                  `}
                >
                  <Icon className={`h-6 w-6 ${isOpen ? "mr-4" : ""}`} />
                  <span className={`whitespace-nowrap transition-all duration-300 ${!isOpen && "opacity-0 hidden"}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function Header({ toggleSidebar, onLogout, sidebarOpen }) {
  return (
    <header className={`bg-white shadow-md fixed top-0 left-0 right-0 h-16 flex items-center z-40 transition-all duration-300 ${sidebarOpen ? "pl-64" : "pl-20"}`}>
      <div className="flex items-center justify-between w-full px-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-grow"></div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800 hidden sm:block">Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-sm text-red-600 font-semibold px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
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
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <section className="bg-gray-100 p-6 rounded-xl shadow-inner min-h-[calc(100vh-12rem)]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-3xl font-bold text-gray-900">{counts.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Counselors</h3>
            <p className="text-3xl font-bold text-gray-900">{counts.totalCounselors}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Escalated Cases</h3>
            <p className="text-3xl font-bold text-gray-900">{counts.escalatedToAdminCases}</p>
          </div>
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
    counselors: "Counselor Management",
    registeredlist: "Student Management",
    admin: "Profile",
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} sidebarOpen={sidebarOpen} />
      <main
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64 lg:ml-64" : "ml-20 lg:ml-20"
        } pt-20 pb-8 px-4 sm:px-6 lg:px-8`}
      >
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{pageTitle[activePage]}</h1>

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "register" && <RegisteredStudent />}
        {activePage === "counselors" && <CounselorList />}
        {activePage === "registeredlist" && <StudentList />}
        {activePage === "admin" && <AdminPanel />}
        {activePage === "hodadmin" && <Register/>}
      </main>
    </div>
  );
}

export default App;