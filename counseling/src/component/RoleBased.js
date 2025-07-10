import React, { useState } from 'react';
import Register from '../pages/Register';
import Login from '../pages/Login';
import RoleBased from '../component/RoleBased';

function App() {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('register');

  const addUser = (newUser) => {
    setRegisteredUsers([...registeredUsers, newUser]);
    setCurrentPage('login');
  };

  const loginUser = (email, password) => {
    const found = registeredUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setLoggedInUser(found);
    } else {
      return false;
    }
    return true;
  };

  if (loggedInUser) {
    return <RoleBased role={loggedInUser.role} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {currentPage === 'register' ? (
        <Register onRegister={addUser} switchToLogin={() => setCurrentPage('login')} />
      ) : (
        <Login onLogin={loginUser} switchToRegister={() => setCurrentPage('register')} />
      )}
    </div>
  );
}

export default App;
