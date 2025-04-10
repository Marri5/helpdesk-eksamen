import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const authLinks = (
    <div className="flex flex-col md:flex-row md:ml-auto">
      {user && user.role === 'admin' ? (
        <Link 
          to="/admin" 
          className="px-4 py-2 text-white hover:text-gray-200"
        >
          Dashboard
        </Link>
      ) : (
        <Link 
          to="/dashboard" 
          className="px-4 py-2 text-white hover:text-gray-200"
        >
          <span className="hidden md:inline">Dashboard</span>
          <span className="md:hidden">Dashboard</span>
        </Link>
      )}
      <button
        onClick={onLogout}
        className="px-4 py-2 text-white hover:text-gray-200 text-left"
      >
        <i className="fas fa-sign-out-alt mr-1"></i>
        <span className="hidden md:inline">Logout</span>
        <span className="md:hidden">Logout</span>
      </button>
    </div>
  );

  const guestLinks = (
    <div className="flex flex-col md:flex-row md:ml-auto">
      <Link 
        to="/register" 
        className="px-4 py-2 text-white hover:text-gray-200"
      >
        Register
      </Link>
      <Link 
        to="/login" 
        className="px-4 py-2 text-white hover:text-gray-200"
      >
        Login
      </Link>
    </div>
  );

  return (
    <nav className="bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white text-xl font-bold">
            <i className="fa fa-ticket-alt mr-2"></i> HelpDesk
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-gray-200 focus:outline-none"
              onClick={toggleMenu}
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            {isAuthenticated ? authLinks : guestLinks}
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {isAuthenticated ? authLinks : guestLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 