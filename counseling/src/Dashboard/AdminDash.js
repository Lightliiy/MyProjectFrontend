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
  BarChart2,
  ClipboardList,
  CheckCircle,
  Bell,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import recharts for the charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// Import your other components here
import CounselorList from "../component/CounselorList";
import RegisteredStudent from "../component/RegisteredStudent";
import StudentList from "../pages/StudentList";
import AdminPanel from "../component/AdminPanel";
import Register from "../pages/Register";



const StatCard = ({ title, value, icon, color }) => (
  <div className={`relative bg-white p-6 rounded-2xl shadow-lg border-t-4 ${color} transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
    <div className="absolute top-4 right-4 text-gray-200 opacity-60">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-5xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.program} (${value})`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

function Dashboard() {
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalCounselors: 0,
    escalatedToAdminCases: 0,
    casesByStatus: [],
    studentsByProgram: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

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
    <section className="p-8 space-y-10 bg-gray-50 rounded-lg shadow-sm">
      <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
        Admin Dashboard<span className="text-indigo-600"></span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl">
        Comprehensive overview of key metrics and student data.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          title="Total Students"
          value={counts.totalStudents}
          icon={<Users className="w-16 h-16" />}
          color="border-indigo-500"
        />
        <StatCard
          title="Total Counselors"
          value={counts.totalCounselors}
          icon={<Briefcase className="w-16 h-16" />}
          color="border-green-500"
        />
        <StatCard
          title="Escalated Booking"
          value={counts.escalatedToAdminCases}
          icon={<AlertTriangle className="w-16 h-16" />}
          color="border-red-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cases by Status Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Booking by Status</h2>
          {counts.casesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={counts.casesByStatus} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" stroke="#6B7280" tickMargin={10} />
                <YAxis stroke="#6B7280" tickMargin={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="count" name="Cases" fill="#3B82F6" barSize={40} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No booking data available.</p>
          )}
        </div>

        {/* Students by Program Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Students by Program</h2>
          {counts.studentsByProgram.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={counts.studentsByProgram}
                  dataKey="count"
                  nameKey="program"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  onMouseEnter={onPieEnter}
                >
                  {counts.studentsByProgram.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No student program data available.</p>
          )}
        </div>
      </div>
    </section>
  );
}


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


function Header({ sidebarOpen, toggleSidebar, onLogout }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch requests from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/change-requests");
      const pending = res.data.filter((r) => r.status === "PENDING");
      setNotifications(pending);
      setNotificationCount(pending.length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    setOpenDropdown(!openDropdown);
  };

  const goToRequests = () => {
    setOpenDropdown(false);
    navigate("/admin"); // redirect to ChangeRequests page
  };

  return (
    <header
      className={`bg-white shadow-md fixed top-0 left-0 right-0 h-16 flex items-center z-40 transition-all duration-300 ${
        sidebarOpen ? "pl-64" : "pl-20"
      }`}
    >
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
          {/* 🔔 Notification Bell Button */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
            </button>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                {notificationCount}
              </span>
            )}

            {/* Dropdown */}
            {openDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b font-semibold">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">No new requests</div>
                ) : (
                  <ul>
                    {notifications.map((req) => (
                      <li
                        key={req.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={goToRequests}
                      >
                        {req.student?.name} requested counselor change
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 👤 Admin Profile */}
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-800 hidden sm:block">
              Admin
            </span>
          </div>

          {/* 🚪 Logout */}
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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const pageTitle = {
    dashboard: "Dashboard Overview",
    counselors: "Counselor Management",
    registeredlist: "Student Management",
    admin: "Profile",
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <ToastContainer position="top-right" autoClose={3000} />
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