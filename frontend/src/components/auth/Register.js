import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, setError } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { name, email, password, password2 } = formData;

  useEffect(() => {
    // Clear any existing errors when component mounts
    setError(null);
  }, [setError]);

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // If error, show alert
    if (error) {
      setAlert(error, 'danger');
    }
  }, [isAuthenticated, navigate, error, setAlert]);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger');
    } else {
      try {
        await register({
          name,
          email,
          password
        });
        setAlert('Registration successful', 'success');
      } catch (err) {
        const message = err.response?.data?.msg || 'Registration failed';
        setAlert(message, 'danger');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6 bg-gray-50 border-b border-gray-200">
            <h1 className="text-xl font-bold text-center">
              <i className="fas fa-user-plus mr-2"></i> Register
            </h1>
          </div>
          <div className="p-6">
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  id="name"
                  name="name"
                  placeholder="Enter Name"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  id="email"
                  name="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  id="password"
                  name="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={onChange}
                  minLength="6"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  id="password2"
                  name="password2"
                  placeholder="Confirm Password"
                  value={password2}
                  onChange={onChange}
                  minLength="6"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Register
              </button>
            </form>
            <p className="mt-4 text-center">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 