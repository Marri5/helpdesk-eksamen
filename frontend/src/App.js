import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SupportDashboard from './components/dashboard/SupportDashboard';
import TicketForm from './components/tickets/TicketForm';
import TicketDetails from './components/tickets/TicketDetails';
import NotFound from './components/layout/NotFound';

import { AuthContext, AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

import './App.css';

axios.defaults.baseURL = 'http://10.12.3.77:5000/api';
axios.defaults.withCredentials = true;

const PrivateRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Redirect users to their appropriate dashboards
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'firstline':
      case 'secondline':
        return <Navigate to="/support" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return element;
};

const App = () => {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Alert />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Regular user dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute 
                    element={<UserDashboard />} 
                    allowedRoles={['user']} 
                  />
                } 
              />
              
              {/* Admin dashboard */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute 
                    element={<AdminDashboard />} 
                    allowedRoles={['admin']} 
                  />
                } 
              />

              {/* Support staff dashboard */}
              <Route 
                path="/support" 
                element={
                  <PrivateRoute 
                    element={<SupportDashboard />} 
                    allowedRoles={['firstline', 'secondline']} 
                  />
                } 
              />
              
              {/* Ticket creation - only regular users can create tickets */}
              <Route 
                path="/tickets/new" 
                element={
                  <PrivateRoute 
                    element={<TicketForm />} 
                    allowedRoles={['user']} 
                  />
                } 
              />
              
              {/* Ticket details - accessible by all authenticated users */}
              <Route 
                path="/tickets/:id" 
                element={
                  <PrivateRoute 
                    element={<TicketDetails />} 
                    allowedRoles={['user', 'admin', 'firstline', 'secondline']} 
                  />
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;
