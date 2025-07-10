import React, { useState } from 'react';
import CounselorList from '../component/CounselorList';
import RegisteredStudent from '../component/RegisteredStudent';
import StudentManagement from '../component/StudentManagement';
import StudentList from '../pages/StudentList';
import AdminPanel from '../component/AdminPanel';
import { useNavigate } from 'react-router-dom';

function Sidebar({ isOpen, activePage, setActivePage }) {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Register Student', id: 'register' },
    { label: 'Student Management', id: 'students' },
    { label: 'Counselor List', id: 'counselors' },
    { label: 'Student List', id: 'registeredlist' },
    { label: 'Admin Panel', id: 'admin' }
  ];

  return (
    <aside className={`bg-indigo-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-center h-16 border-b border-indigo-700">
        <span className={`font-bold text-xl ${!isOpen && 'hidden'}`}>Admin Panel</span>
        <svg className={`h-6 w-6 ${isOpen && 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${activePage === item.id
                    ? 'bg-indigo-700 text-white'
                    : 'hover:bg-indigo-800'}`}
              >
                <span className={!isOpen ? 'hidden' : ''}>{item.label}</span>
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
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Admin</span>
          </div>
          <button onClick={onLogout} className="text-sm text-red-600 font-semibold hover:underline">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InfoCard title="Students" stats={[['Total Students', 0], ['Regular Status', 0], ['On Probation', 0]]} />
      <InfoCard title="Counselors" stats={[['Total Counselors', 0], ['Active', 0], ['On Leave', 0]]} />
      <InfoCard title="Department Stats" stats={[['Computing', 0], ['Science', 0]]} />
    </div>
  );
}

function InfoCard({ title, stats }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {stats.map(([label, value], idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-600">{label}</span>
            <span className={`font-semibold ${label.includes('Probation') ? 'text-red-600' : label.includes('Active') ? 'text-green-600' : ''}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // if you're storing session data
    navigate('/login'); // redirect to login page
  };

  const pageTitle = {
    dashboard: 'Dashboard Overview',
    register: '',
    students: '',
    counselors: '',
    registeredlist: '',
    admin: 'HOD Profile',
    settings: 'System Settings',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} pt-16 pb-16 p-6`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{pageTitle[activePage]}</h1>

          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'register' && <RegisteredStudent />}
          {activePage === 'students' && <StudentManagement />}
          {activePage === 'counselors' && <CounselorList />}
          {activePage === 'registeredlist' && <StudentList />}
          {activePage === 'admin' && <AdminPanel />}
      
        </div>
      </main>
    </div>
  );
}

export default App;
