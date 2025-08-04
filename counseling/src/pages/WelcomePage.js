import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#cfd9df] to-[#e2ebf0]">
      <div className="bg-white shadow-2xl p-10 rounded-2xl text-center max-w-xl">
        <img
          src= "https://cdn-icons-png.flaticon.com/512/3602/3602123.png" // counseling illustration
          alt="Counseling Illustration"
          className="w-24 mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to Your Counseling Companion</h1>
        <p className="mb-6 text-gray-600 text-sm leading-relaxed">
          This system helps students connect with counselors, share concerns, and receive professional
          guidance in a confidential and supportive environment.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
