import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // Redirect if logged in
  if (isAuthenticated) {
    return user.role === 'admin' ? (
      <Navigate to="/admin" />
    ) : (
      <Navigate to="/dashboard" />
    );
  }

  return (
    <section className="landing">
      <div className="dark-overlay">
        <div className="landing-inner">
          <h1 className="x-large">HelpDesk System</h1>
          <p className="lead">
            Get support for your IT issues quickly and efficiently
          </p>
          <div className="buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-light">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing; 