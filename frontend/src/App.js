import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TicketForm from './components/tickets/TicketForm';
import TicketDetails from './components/tickets/TicketDetails';
import NotFound from './components/layout/NotFound';

import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

import './App.css';

axios.defaults.baseURL = 'http://10.12.3.77:5000/api';
axios.defaults.withCredentials = true;

const PrivateRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
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
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute 
                    element={<UserDashboard />} 
                    allowedRoles={['user', 'admin']} 
                  />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute 
                    element={<AdminDashboard />} 
                    allowedRoles={['admin']} 
                  />
                } 
              />
              <Route 
                path="/tickets/new" 
                element={
                  <PrivateRoute 
                    element={<TicketForm />} 
                    allowedRoles={['user', 'admin']} 
                  />
                } 
              />
              <Route 
                path="/tickets/:id" 
                element={
                  <PrivateRoute 
                    element={<TicketDetails />} 
                    allowedRoles={['user', 'admin']} 
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
