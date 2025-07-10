import React, { useState } from 'react';
import {
  Menu,
  Bell,
  UserCircle,
  ChevronDown,
  Camera,
  Pencil,
} from 'lucide-react';

import CounselorRegistration from '../component/CounselorRegistration';
import CasePage from '../component/CasePage';
import HODDashboardOverview from '../component/HeadPage';

// Sidebar Component
const Sidebar = ({ isOpen, activePage, setActivePage }) => {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Register Counselor', id: 'register' },
    { label: 'Case Management', id: 'cases' },
    { label: 'Settings', id: 'settings' },
  ];

  return (
    <aside className={`bg-indigo-900 text-white h-screen fixed top-0 left-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-center h-16 border-b border-indigo-700">
        <span className={`font-bold text-xl ${!isOpen && 'hidden'}`}>HOD Panel</span>
        <Menu className={`h-6 w-6 ${isOpen && 'hidden'}`} />
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activePage === item.id ? 'bg-indigo-700' : 'hover:bg-indigo-800'
                }`}
              >
                <span className={!isOpen && 'hidden'}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// Header Component
const Header = ({ toggleSidebar, profileImage, onProfileImageClick, department = 'Head of' }) => (
  <header className="bg-white shadow fixed top-0 right-0 left-0 h-16 z-10">
    <div className="flex items-center justify-between h-full px-4">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-medium text-gray-600">{department} Department</span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center space-x-2">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover cursor-pointer"
              onClick={onProfileImageClick}
            />
          ) : (
            <UserCircle className="h-8 w-8 text-gray-400 cursor-pointer" onClick={onProfileImageClick} />
          )}
          <span className="font-medium">HOD</span>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  </header>
);

// Settings Component
const Settings = ({ profileImage, onProfileImageChange }) => {
  const [name, setName] = useState('HOD User');
  const [email, setEmail] = useState('hod@example.com');

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onProfileImageChange(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCircle className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-indigo-600 p-1 rounded-full cursor-pointer hover:bg-indigo-700">
            <Camera className="h-4 w-4 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-gray-500">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            />
            <Pencil className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            />
            <Pencil className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <button className="mt-6 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 w-full">
        Save Changes
      </button>
    </div>
  );
};

// Main HOD App component
const HODApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(null);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <HODDashboardOverview />;
      case 'register':
        return <CounselorRegistration />;
      case 'cases':
        return <CasePage />;
      case 'settings':
        return <Settings profileImage={profileImage} onProfileImageChange={setProfileImage} />;
      default:
        return <HODDashboardOverview />;
    }
  };

  const pageTitles = {
    dashboard: 'Department Overview',
    register: 'Register Counselor',
    cases: 'Case Management',
    settings: 'Settings'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} profileImage={profileImage} onProfileImageClick={() => setActivePage('settings')} />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} pt-20 pb-16 p-6`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{pageTitles[activePage]}</h1>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HODApp;
