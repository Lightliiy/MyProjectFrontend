import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Student from "../component/Student";
import Settings from "../pages/Setting";
import Notifications from "../component/Notifications";
import Chats from "../component/Chats";
import { FaTachometerAlt, FaUsers, FaBell, FaComments, FaCog } from "react-icons/fa";

// Define menu items once, outside the component, to prevent unnecessary re-renders.
const menuItems = [
  { label: "Dashboard", id: "dashboard", icon: <FaTachometerAlt /> },
  { label: "Students", id: "students", icon: <FaUsers /> },
  { label: "Notifications", id: "notifications", icon: <FaBell /> },
  { label: "Chat", id: "chat", icon: <FaComments /> },
  { label: "Settings", id: "settings", icon: <FaCog /> },
];

/**
 * Sidebar component for navigation.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the width of the sidebar.
 * @param {string} props.activePage - The ID of the currently active page.
 * @param {function} props.setActivePage - Function to set the active page.
 */
function Sidebar({ isOpen, activePage, setActivePage }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-indigo-900 text-white transition-width duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col shadow-2xl z-30`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center border-b border-indigo-800 font-semibold text-xl tracking-wide px-4">
        {isOpen ? "Counselor Panel" : "CP"}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-4">
        <ul className="flex flex-col gap-2 p-3">
          {menuItems.map(({ label, id, icon }) => (
            <li key={id}>
              <button
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-4 w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activePage === id
                    ? "bg-indigo-800 text-white shadow-md"
                    : "text-indigo-300 hover:bg-indigo-700 hover:text-white"
                }`}
              >
                <span className="text-lg">{icon}</span>
                {isOpen && <span className="flex-1 text-left">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 text-center text-xs text-indigo-400">
        © {new Date().getFullYear()} Counsel
      </div>
    </aside>
  );
}

/**
 * Header component with a sidebar toggle and counselor profile info.
 * @param {object} props
 * @param {function} props.toggleSidebar - Function to toggle the sidebar.
 * @param {object} props.user - User data object.
 */
function Header({ toggleSidebar, user }) {
  const { name, profileImage } = user;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 z-20 shadow-sm">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-indigo-700 hover:text-indigo-900 focus:outline-none transition-colors mr-6"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Counselor Profile Section */}
      <div className="flex-1 flex justify-end items-center space-x-3">
        <span className="font-medium text-gray-800">{name || "Counselor"}</span>
        {profileImage ? (
          <img src={profileImage} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-300" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-semibold uppercase text-lg">
            {name ? name.charAt(0) : "C"}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Dashboard component displaying key metrics.
 * @param {object} props
 * @param {string} props.counselorId - The ID of the current counselor.
 */
function Dashboard({ counselorId }) {
  const [studentCount, setStudentCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!counselorId) return;

    async function fetchCounts() {
      try {
        setLoading(true);
        const studentRes = await fetch(`http://localhost:8080/api/counselors/${counselorId}/studentCount`);
        const studentData = await studentRes.json();

        const bookingRes = await fetch(`http://localhost:8080/api/bookings/counselor/${counselorId}/count`);
        const bookingData = await bookingRes.json();

        setStudentCount(studentData.count || 0);
        setBookingCount(bookingData.count || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [counselorId]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-20 text-xl font-medium">
        Loading dashboard...
      </div>
    );
  }

  return (
    <section className="text-gray-800 p-8">
      <h2 className="text-4xl font-bold mb-2 text-gray-800">
        Welcome, Counselor
      </h2>
      <p className="text-lg text-gray-600 mb-10">
        Here's a quick overview of your students and upcoming sessions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card for Assigned Students */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-indigo-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Assigned Students
          </h3>
          <p className="text-5xl font-extrabold text-indigo-600">{studentCount}</p>
        </div>

        {/* Card for Total Bookings */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border-l-4 border-indigo-500">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Total Bookings
          </h3>
          <p className="text-5xl font-extrabold text-indigo-600">{bookingCount}</p>
        </div>
      </div>
    </section>
  );
}

/**
 * A container component to manage the rendering of different pages.
 * @param {object} props
 * @param {string} props.activePage - The ID of the active page.
 * @param {object} props.user - The user object.
 * @param {function} props.setUser - Function to update the user state.
 */
function MainContent({ activePage, user, setUser }) {
  const { id } = user || {}; // Use optional chaining to prevent errors if user is null

  const renderPage = () => {
    if (!id) {
        return <div className="text-center text-gray-500 mt-20">User data not available.</div>;
    }
    
    switch (activePage) {
      case "dashboard":
        return <Dashboard counselorId={id} />;
      case "students":
        return <Student counselorId={id} />;
      case "notifications":
        return <Notifications counselorId={id} />;
      case "chat":
        return <Chats counselorId={id} />;
      case "settings":
        return <Settings user={user} setUser={setUser} userRole="COUNSELOR" />;
      default:
        return <Dashboard counselorId={id} />;
    }
  };

  return (
    <main className="pt-20 px-8 pb-8 flex-grow overflow-y-auto">
      {renderPage()}
    </main>
  );
}


// The main component for the counselor's dashboard
function Counselordash({ user, onLogout, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // The ProtectedRoute in App.js should handle this, but it's a good practice
  if (!user || user.role !== 'COUNSELOR') {
      return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 antialiased">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "16rem" : "5rem" }}
      >
        <Header toggleSidebar={toggleSidebar} user={user} />
        <MainContent activePage={activePage} user={user} setUser={setUser} />
      </div>
    </div>
  );
}

export default Counselordash;