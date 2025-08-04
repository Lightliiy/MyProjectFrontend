import React, { useState, useEffect } from "react";
import Student from "../component/Student";
import Settings from "../pages/Setting";
import Notifications from "../component/Notifications";
import Chats from "../component/Chats";
import { FaTachometerAlt, FaUsers, FaBell, FaComments, FaCog } from "react-icons/fa";

function Sidebar({ isOpen, activePage, setActivePage }) {
  const menuItems = [
    { label: "Dashboard", id: "dashboard", icon: <FaTachometerAlt /> },
    { label: "Students", id: "students", icon: <FaUsers /> },
    { label: "Notifications", id: "notifications", icon: <FaBell /> },
    { label: "Chat", id: "chat", icon: <FaComments /> },
    { label: "Settings", id: "settings", icon: <FaCog /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-indigo-900 text-white transition-width duration-300 ${
        isOpen ? "w-56" : "w-16"
      } flex flex-col`}
    >
      <div className="h-16 flex items-center justify-center border-b border-indigo-800 font-semibold text-xl tracking-wide">
        {isOpen ? "Counselor Panel" : "CP"}
      </div>
      <nav className="flex-1 mt-4">
        <ul className="flex flex-col gap-1">
          {menuItems.map(({ label, id, icon }) => (
            <li key={id}>
              <button
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-4 w-full px-4 py-3 hover:bg-indigo-700 focus:bg-indigo-700 transition-colors ${
                  activePage === id ? "bg-indigo-800" : ""
                }`}
              >
                <span className="text-lg">{icon}</span>
                {isOpen && <span className="font-medium">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-center text-xs text-indigo-400 select-none"> 2025 Counsel</div>
    </aside>
  );
}

function Header({ toggleSidebar, counselor }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 z-20 justify-between">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-indigo-700 hover:text-indigo-900 focus:outline-none mr-6"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center space-x-3">
        {counselor.profileImage ? (
          <img
            src={counselor.profileImage}
            alt={counselor.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold uppercase">
            {counselor.name ? counselor.name.charAt(0) : "?"}
          </div>
        )}
        <span className="font-medium text-gray-800">{counselor.name || "Counselor"}</span>
      </div>
    </header>
  );
}

function Dashboard({ counselorId }) {
  const [studentCount, setStudentCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!counselorId) return;

    async function fetchCounts() {
      try {
        setLoading(true);
        const studentRes = await fetch(
          `http://localhost:8080/api/counselors/${counselorId}/studentCount`
        );
        const studentData = await studentRes.json();

        const bookingRes = await fetch(
          `http://localhost:8080/api/bookings/counselor/${counselorId}/count`
        );
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
      <div className="text-center text-gray-600 mt-10 text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <section className="text-gray-800 px-6 py-8">
      <h2 className="text-3xl font-semibold mb-4"> Welcome </h2>
      <p className="text-base text-gray-600 mb-8">
        Overview of your assigned students and session bookings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Assigned Students
          </h3>
          <p className="text-4xl font-bold text-indigo-700">{studentCount}</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Total Bookings
          </h3>
          <p className="text-4xl font-bold text-indigo-700">{bookingCount}</p>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [counselor, setCounselor] = useState({
    id: "",
    name: "",
    profileImage: "",
    availableSlots: [],
    isOnline: false,
    description: "",
    assignedStudentIds: [],
  });

 useEffect(() => {
  const counselorEmail = localStorage.getItem("counselorEmail");
  if (!counselorEmail) {
    console.error("Counselor email is missing.");
    return;
  }
  fetch(`http://localhost:8080/api/counselors/profile?email=${counselorEmail}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch counselor profile");
      return res.json();
    })
    .then((data) => setCounselor(data))
    .catch((err) => console.error("Error loading counselor profile:", err));
}, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <div
        className="flex-1 flex flex-col transition-margin duration-300"
        style={{ marginLeft: sidebarOpen ? 224 : 64 }}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} counselor={counselor} />
        <main className="pt-16 px-8 flex-grow overflow-auto">
          {activePage === "dashboard" && <Dashboard counselorId={counselor.id} />}
          {activePage === "students" && <Student counselorId={counselor.id} />}
          {activePage === "notifications" && <Notifications counselorId={counselor.id} />}
          {activePage === "chat" && <Chats counselorId={counselor.id} />}
          {activePage === "settings" && (
            <Settings counselor={counselor} setCounselor={setCounselor} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
