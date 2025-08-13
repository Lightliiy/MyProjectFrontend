import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-purple-200">
      <div 
        className="
          bg-white 
          rounded-3xl 
          shadow-xl 
          p-12 
          text-center 
          max-w-xl 
          transform 
          hover:scale-105 
          transition-transform 
          duration-500 
          ease-in-out
        "
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/3602/3602123.png"
          alt="Counseling Illustration"
          className="w-28 h-28 mx-auto mb-8 animate-pulse-slow"
        />
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
          Welcome to Your Counseling Companion
        </h1>
        <p className="mb-8 text-gray-500 text-lg leading-relaxed">
          This system helps students connect with counselors, share concerns, and receive professional guidance in a confidential and supportive environment.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="
            bg-indigo-600 
            text-white 
            font-semibold 
            py-3 
            px-10 
            rounded-full 
            shadow-lg 
            hover:bg-indigo-700 
            hover:-translate-y-1 
            transition-all 
            duration-300
          "
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;