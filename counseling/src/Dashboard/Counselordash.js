import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Student from "../component/Student";
import Settings from "../pages/Setting";
import Notifications from "../component/Notifications";
import Chats from "../component/Chats";
import { FaTachometerAlt, FaUsers, FaBell, FaComments, FaCog } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { IoPeopleOutline, IoCalendarOutline, IoTimeOutline, IoLogOutOutline } from "react-icons/io5";

const menuItems = [
  { label: "Dashboard", id: "dashboard", icon: <FaTachometerAlt /> },
  { label: "Students", id: "students", icon: <FaUsers /> },
  { label: "Notifications", id: "notifications", icon: <FaBell /> },
  { label: "Chat", id: "chat", icon: <FaComments /> },
  { label: "Settings", id: "settings", icon: <FaCog /> },
];

function Sidebar({ isOpen, activePage, setActivePage, onLogout }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-indigo-900 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col shadow-2xl z-30`}
    >
      <div className="h-16 flex items-center justify-center border-b border-indigo-800 font-extrabold text-2xl tracking-wide px-4 text-white">
        {isOpen ? "Counselor" : "C"}
      </div>

      <nav className="flex-1 mt-6">
        <ul className="flex flex-col gap-2 p-3">
          {menuItems.map(({ label, id, icon }) => (
            <li key={id}>
              <button
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activePage === id
                    ? "bg-indigo-700 text-white shadow-lg"
                    : "text-indigo-300 hover:bg-indigo-700 hover:text-white"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {isOpen && <span className="flex-1 text-left">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-indigo-300 hover:bg-red-600 hover:text-white"
        >
          <span className="text-xl">
            <IoLogOutOutline />
          </span>
          {isOpen && <span className="flex-1 text-left">Logout</span>}
        </button>
      </div>

      <div className="p-4 text-center text-xs text-indigo-400 border-t border-indigo-800">
        © {new Date().getFullYear()} Counsel
      </div>
    </aside>
  );
}

function Header({ toggleSidebar, user }) {
  const { name, profileImage } = user;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 z-20 shadow-sm">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors mr-6"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1 flex justify-end items-center space-x-3">
        <span className="font-semibold text-gray-800">{name || "Counselor"}</span>
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold uppercase text-lg">
            {name ? name.charAt(0) : "C"}
          </div>
        )}
      </div>
    </header>
  );
}

const IssueTypeBarChart = ({ issueStats }) => {
  const total = Object.values(issueStats).reduce((a, b) => a + b, 0);

  const data = Object.entries(issueStats).map(([type, count]) => ({
    issue: type,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Most Booked Issues (%)</h2>
      <p className="text-sm text-gray-500 mb-6">
        A breakdown of booking issues based on their percentage.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="issue" tick={{ fill: '#4b5563' }} />
          <YAxis unit="%" tick={{ fill: '#4b5563' }} />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
            formatter={(value) => [`${value}%`, "Percentage"]}
            labelFormatter={(label) => `Issue: ${label}`}
          />
          <Bar dataKey="percentage" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardOverview = ({ data }) => {
  const {
    studentCount = 0,
    bookingCount = 0,
    pendingBookings = 0,
    issueStats = {},
  } = data;

  const StatCard = ({ title, value, icon, borderColor, iconColor, textColor }) => (
    <div className={`relative p-6 rounded-2xl shadow-lg border-t-4 ${borderColor} bg-white transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
      <div className={`absolute top-4 right-4 text-4xl ${iconColor} opacity-70`}>
        {icon}
      </div>
      <p className={`text-sm font-medium ${textColor}`}>{title}</p>
      <p className="text-5xl font-extrabold text-gray-900 mt-2">{value}</p>
    </div>
  );

  return (
    <div className="p-8 space-y-10 bg-gray-50 rounded-lg shadow-sm">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          Counselor Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Comprehensive overview of your assigned students and bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          title="Assigned Students"
          value={studentCount}
          icon={<IoPeopleOutline />}
          borderColor="border-indigo-500"
          iconColor="text-indigo-500"
          textColor="text-gray-500"
        />
        <StatCard
          title="Total Bookings"
          value={bookingCount}
          icon={<IoCalendarOutline />}
          borderColor="border-green-500"
          iconColor="text-green-500"
          textColor="text-gray-500"
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          icon={<IoTimeOutline />}
          borderColor="border-yellow-500"
          iconColor="text-yellow-500"
          textColor="text-gray-500"
        />
      </div>

      {/* Popular Issues Chart */}
      <IssueTypeBarChart issueStats={issueStats} />
    </div>
  );
};

function Dashboard({ counselorId }) {
  const [dashboardData, setDashboardData] = useState({
    studentCount: 0,
    bookingCount: 0,
    pendingBookings: 0,
    issueStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!counselorId) return;

    async function fetchDashboardData() {
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

        const pendingRes = await fetch(
          `http://localhost:8080/api/bookings/counselor/${counselorId}/pending/count`
        );
        const pendingData = await pendingRes.json();

        const issueRes = await fetch(
          `http://localhost:8080/api/bookings/counselor/${counselorId}/issue-type-stats`
        );
        const issueData = await issueRes.json();

        setDashboardData({
          studentCount: studentData.count || 0,
          bookingCount: bookingData.count || 0,
          pendingBookings: pendingData.count || 0,
          issueStats: issueData || {},
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [counselorId]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-20 text-xl font-medium">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20 text-xl font-medium">
        {error}
      </div>
    );
  }

  return <DashboardOverview data={dashboardData} />;
}

function MainContent({ activePage, user, setUser }) {
  const { id, name } = user || {};

  const renderPage = () => {
    if (!id || !name) {
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
        return <Chats counselorId={id} counselorName={name} />;
      case "settings":
        return <Settings user={user} setUser={setUser} userRole="COUNSELOR" />;
      default:
        return <Dashboard counselorId={id} />;
    }
  };

  return <main className="pt-20 px-8 pb-8 flex-grow overflow-y-auto">{renderPage()}</main>;
}

function Counselordash({ user, onLogout, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user || user.role !== "COUNSELOR") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 antialiased">
      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />
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