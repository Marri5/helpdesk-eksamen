import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated) {
    return user.role === 'admin' ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/dashboard" />
    );
  }

  return (
    <section className="landing">
      <div className="landing-inner flex flex-col items-center justify-center text-center text-white h-full">
        <h1 className="text-5xl font-bold mb-4">HelpDesk System</h1>
        <p className="text-xl mb-8">
          Get support for your IT issues quickly and efficiently
        </p>
        <div className="flex space-x-4">
          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
          <Link to="/login" className="bg-white text-primary px-4 py-2 rounded font-medium hover:bg-gray-100 transition duration-300">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Landing; 