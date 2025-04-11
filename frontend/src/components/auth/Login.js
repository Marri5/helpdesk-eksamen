import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, setError, user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [cooldownTime, setCooldownTime] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  useEffect(() => {
    setError(null);
    
    const checkCooldown = () => {
      const storedCooldown = localStorage.getItem('loginCooldown');
      if (storedCooldown) {
        const remainingTime = Math.max(0, parseInt(storedCooldown) - Date.now());
        if (remainingTime > 0) {
          setCooldownTime(remainingTime);
          const interval = setInterval(() => {
            setCooldownTime(time => {
              const newTime = Math.max(0, time - 1000);
              if (newTime === 0) {
                localStorage.removeItem('loginCooldown');
                clearInterval(interval);
              }
              return newTime;
            });
          }, 1000);
          return () => clearInterval(interval);
        } else {
          localStorage.removeItem('loginCooldown');
        }
      }
    };
    
    checkCooldown();
  }, [setError]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }

    if (error) {
      setAlert(error, 'danger');
    }
  }, [isAuthenticated, navigate, error, setAlert, user]);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    
    if (cooldownTime > 0) {
      setAlert(`Please wait ${Math.ceil(cooldownTime / 1000)} seconds before trying again`, 'danger');
      return;
    }

    if (!email || !password) {
      setAlert('Please fill in all fields', 'danger');
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setAlert(message, 'danger');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6 bg-gray-50 border-b border-gray-200">
            <h1 className="text-xl font-bold text-center">
              <i className="fas fa-sign-in-alt mr-2"></i> Login
            </h1>
          </div>
          <div className="p-6">
            <form onSubmit={onSubmit}>
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
                  disabled={cooldownTime > 0}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  id="password"
                  name="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={onChange}
                  disabled={cooldownTime > 0}
                  required
                />
              </div>
              {cooldownTime > 0 && (
                <div className="mb-4 text-center text-red-600">
                  Please wait {Math.ceil(cooldownTime / 1000)} seconds before trying again
                </div>
              )}
              <button
                type="submit"
                className={`w-full ${cooldownTime > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'} text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                disabled={cooldownTime > 0}
              >
                {cooldownTime > 0 ? `Wait ${Math.ceil(cooldownTime / 1000)}s` : 'Login'}
              </button>
            </form>
            <p className="mt-4 text-center">
              No Account? <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 