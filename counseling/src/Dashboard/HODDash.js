import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  UserCircle,
  ChevronDown,
  BarChart2,
  Users,
  Briefcase,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

// Import your components (make sure paths are correct)
import CounselorRegistration from '../component/CounselorRegistration';
import CasePage from '../component/CasePage';
import Settings from '../pages/Setting';

const HODDashboardOverview = ({ data }) => {
  const {
    totalCounselors,
    pendingBookings,
    totalStudents,
    casesByStatus = [],
    studentsByProgram = [],
  } = data;

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

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

  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="p-8 space-y-10 bg-gray-50 rounded-lg shadow-sm">
      <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
        HOD Dashboard
        <span className="text-indigo-600"></span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl">
        Comprehensive overview of key metrics, case statuses, and student demographics.
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Counselors" 
          value={totalCounselors} 
          icon={<Users className="w-16 h-16" />}
          color="border-indigo-500"
        />
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          icon={<Briefcase className="w-16 h-16" />}
          color="border-green-500"
        />
        <StatCard 
          title="Pending Cases" 
          value={pendingBookings} 
          icon={<ClipboardList className="w-16 h-16" />}
          color="border-yellow-500"
        />
        <StatCard 
          title="Resolved Cases" 
          value={data.resolvedCases || 0}
          icon={<CheckCircle className="w-16 h-16" />}
          color="border-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cases by Status */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Booking by Status</h2>
          {casesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={casesByStatus} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" stroke="#6B7280" tickMargin={10} />
                <YAxis stroke="#6B7280" tickMargin={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="count" name="Cases" fill="#3B82F6" barSize={40} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No case data available.</p>
          )}
        </div>

        {/* Students by Program */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Students by Program</h2>
          {studentsByProgram.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={studentsByProgram}
                  dataKey="count"
                  nameKey="program"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  onMouseEnter={onPieEnter}
                >
                  {studentsByProgram.map((entry, index) => (
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
    </div>
  );
};


const Sidebar = ({ isOpen, activePage, setActivePage }) => {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    { label: 'Register Counselor', id: 'register', icon: <Users className="h-5 w-5" /> },
    { label: 'Case Management', id: 'cases', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Settings', id: 'settings', icon: <ClipboardList className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={`bg-indigo-900 text-white h-screen fixed top-0 left-0 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex items-center h-16 border-b border-indigo-700">
        <span
          className={`font-bold text-xl transition-opacity duration-300 ${
            !isOpen && 'opacity-0 absolute'
          }`}
        >
          HOD Panel
        </span>
        <div className={`transition-opacity duration-300 ${isOpen && 'opacity-0 absolute'}`}>
          <Menu className="h-6 w-6 ml-4" />
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-indigo-700 text-white shadow-lg'
                    : 'text-indigo-300 hover:bg-indigo-800'
                }`}
              >
                {item.icon}
                <span className={`transition-opacity duration-300 ${!isOpen && 'opacity-0 absolute'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const NotificationDropdown = ({ notifications }) => (
  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
    <div className="py-1">
      <div className="px-4 py-2 font-bold text-gray-800 border-b border-gray-200">
        Notifications
      </div>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <div key={notif.id} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <p className="font-semibold">{notif.title}</p>
            <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
            <p className="text-gray-400 text-xs mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">No new notifications.</div>
      )}
    </div>
  </div>
);


const Header = ({
  toggleSidebar,
  profileImage,
  onProfileImageClick,
  department = 'Head of Department',
  userName,
  unreadCount,
  onBellClick,
  showNotifications,
  notifications,
}) => {
  const bellRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        if (showNotifications) onBellClick();
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showNotifications, onBellClick]);

  return (
    <header className="bg-white shadow fixed top-0 right-0 left-0 h-16 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-700">{department}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={bellRef}>
            <button
              onClick={onBellClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </>
              )}
            </button>
            {showNotifications && <NotificationDropdown notifications={notifications} />}
          </div>

          <div className="flex items-center space-x-2 cursor-pointer" onClick={onProfileImageClick}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500"
              />
            ) : (
              <UserCircle className="h-9 w-9 text-gray-400" />
            )}
            <span className="font-medium text-gray-800 hidden md:inline">{userName || 'HOD'}</span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

// ------------------- Main App -------------------
const HODApp = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCounselors: 0,
    pendingBookings: 0,
    escalatedToAdminBookings: 0,
    casesByStatus: [],
    studentsByProgram: [],
    workloadByCounselor: [],
    resolvedCases: 0, // Added for the new StatCard
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load user info
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setProfileImage(storedUser.profileImage || null);
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8080/notifications/user?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Fetch dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/hod/summary-counts');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        if (loading) return <div className="text-center text-gray-500 mt-20">Loading dashboard data...</div>;
        if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
        return <HODDashboardOverview data={dashboardData} />;
      case 'register':
        return <CounselorRegistration />;
      case 'cases':
        return <CasePage />;
      case 'settings':
        return <Settings user={user} setUser={setUser} userRole="HOD" />;
      default:
        return <HODDashboardOverview data={dashboardData} />;
    }
  };

  const pageTitles = {
    dashboard: 'Dashboard',
    register: 'Register Counselor',
    cases: '',
    settings: '',
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        profileImage={profileImage}
        onProfileImageClick={() => setActivePage('settings')}
        userName={user?.name}
        unreadCount={notifications.length}
        onBellClick={() => setShowNotifications(!showNotifications)}
        showNotifications={showNotifications}
        notifications={notifications}
      />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} pt-16 pb-6 p-6`}>
        <div className="max-w-7xl mx-auto">
          {activePage !== 'dashboard' && (
            <h1 className="text-3xl font-bold mb-6 text-gray-900">{pageTitles[activePage]}</h1>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HODApp;