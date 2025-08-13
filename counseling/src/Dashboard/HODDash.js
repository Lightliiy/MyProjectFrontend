import React, { useState, useEffect } from 'react';
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

// Assuming these components are in the correct paths
import CounselorRegistration from '../component/CounselorRegistration';
import CasePage from '../component/CasePage';
import Settings from '../pages/Setting';

// HODDashboardOverview Component
const HODDashboardOverview = ({ data }) => {
  const { totalCounselors, pendingBookings, totalStudents } = data;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        Welcome, Head of Department! 👋
      </h1>
      <p className="text-gray-600 mb-10 text-lg">
        Here's a quick overview of your key metrics and activities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Counselors</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{totalCounselors}</p>
          </div>
          <Users className="h-10 w-10 text-indigo-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Cases</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{pendingBookings}</p>
          </div>
          <Briefcase className="h-10 w-10 text-yellow-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{totalStudents}</p>
          </div>
          <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
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
        <div
          className={`transition-opacity duration-300 ${isOpen && 'opacity-0 absolute'}`}
        >
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
                <span
                  className={`transition-opacity duration-300 ${
                    !isOpen && 'opacity-0 absolute'
                  }`}
                >
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

// Header Component
const Header = ({
  toggleSidebar,
  profileImage,
  onProfileImageClick,
  department = 'Head of Department',
  userName,
  unreadCount,
}) => (
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
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </button>

        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={onProfileImageClick}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500"
            />
          ) : (
            <UserCircle className="h-9 w-9 text-gray-400" />
          )}
          <span className="font-medium text-gray-800 hidden md:inline">
            {userName || 'HOD'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  </header>
);

// Main HOD App component
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setProfileImage(storedUser.profileImage || null);
    }
  }, []);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/notifications/user?userId=${user.id}`
        );
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  // Fetch dashboard data once on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/hod/summary-counts'
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
        if (loading) {
          return (
            <div className="text-center text-gray-500 mt-20">
              Loading dashboard data...
            </div>
          );
        }
        if (error) {
          return (
            <div className="text-center text-red-500 mt-20">{error}</div>
          );
        }
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
    cases: 'Case Management',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        profileImage={profileImage}
        onProfileImageClick={() => setActivePage('settings')}
        userName={user?.name}
        unreadCount={notifications.length} // Pass unread count to Header
      />
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        } pt-16 pb-6 p-6`}
      >
        <div className="max-w-7xl mx-auto">
          {activePage !== 'dashboard' && (
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              {pageTitles[activePage]}
            </h1>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HODApp;
