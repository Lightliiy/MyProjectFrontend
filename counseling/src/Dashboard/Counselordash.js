import React, { useState } from 'react';
import Student from '../component/Student';
import Settings from '../pages/Setting'; // Make sure this path is correct
import Notifications from '../component/Notifications';
import { FaTachometerAlt, FaUsers, FaBell, FaCog } from 'react-icons/fa';

// Sidebar component
function Sidebar({ isOpen, activePage, setActivePage }) {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard', icon: <FaTachometerAlt /> },
    { label: 'Students', id: 'students', icon: <FaUsers /> },
    { label: 'Notifications', id: 'notifications', icon: <FaBell /> },
    { label: 'Settings', id: 'settings', icon: <FaCog /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-indigo-900 text-white transition-width duration-300 ${
        isOpen ? 'w-56' : 'w-16'
      } flex flex-col`}
    >
      <div className="h-16 flex items-center justify-center border-b border-indigo-800 font-semibold text-xl tracking-wide">
        {isOpen ? 'Counselor Panel' : 'CP'}
      </div>
      <nav className="flex-1 mt-4">
        <ul className="flex flex-col gap-1">
          {menuItems.map(({ label, id, icon }) => (
            <li key={id}>
              <button
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-4 w-full px-4 py-3 hover:bg-indigo-700 focus:bg-indigo-700 transition-colors ${
                  activePage === id ? 'bg-indigo-800' : ''
                }`}
              >
                <span className="text-lg">{icon}</span>
                {isOpen && <span className="font-medium">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-center text-xs text-indigo-400 select-none">
        © 2025 Counsel
      </div>
    </aside>
  );
}

// Header component
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Counselor info */}
      <div className="flex items-center space-x-3">
        {counselor.profileImage ? (
          <img
            src={counselor.profileImage}
            alt={counselor.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold uppercase">
            {counselor.name ? counselor.name.charAt(0) : '?'}
          </div>
        )}
        <span className="font-medium text-gray-800">{counselor.name || 'Counselor'}</span>
      </div>
    </header>
  );
}

// Dashboard component
function Dashboard() {
  return (
    <section className="text-indigo-900">
      <h2 className="text-3xl font-semibold mb-6">Welcome back!</h2>
      <p className="text-lg max-w-xl leading-relaxed">
        Here’s an overview of your counseling activities and students.
      </p>
    </section>
  );
}

// Main App component
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [counselor, setCounselor] = useState({
    id: '',
    name: '',
    profileImage: '',
    availableSlots: [],
    isOnline: false,
    description: '',
    assignedStudentIds: [],
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div
        className={`flex-1 flex flex-col transition-margin duration-300`}
        style={{ marginLeft: sidebarOpen ? 224 : 64 }}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} counselor={counselor} />
        <main className="pt-16 px-8 flex-grow overflow-auto">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'students' && <Student searchQuery={searchQuery} />}
          {activePage === 'notifications' && <Notifications />}
          {activePage === 'settings' && (
            <Settings counselor={counselor} setCounselor={setCounselor} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
