import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SupportDashboard from './components/dashboard/SupportDashboard';
import TicketForm from './components/tickets/TicketForm';
import TicketDetails from './components/tickets/TicketDetails';
import NotFound from './components/layout/NotFound';
import PrivateRoute from './components/routing/PrivateRoute';

import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

import './App.css';

axios.defaults.baseURL = 'http://10.12.3.77:5000/api';
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Alert />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    {({ user }) => {
                      if (user.role === 'admin') {
                        return <Navigate to="/admin" />;
                      } else if (user.role === 'firstline' || user.role === 'secondline') {
                        return <SupportDashboard />;
                      } else {
                        return <Dashboard />;
                      }
                    }}
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    {({ user }) => {
                      if (user.role !== 'admin') {
                        return <Navigate to="/dashboard" />;
                      }
                      return <AdminDashboard />;
                    }}
                  </PrivateRoute>
                }
              />
              <Route
                path="/tickets/new"
                element={
                  <PrivateRoute>
                    <TicketForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <PrivateRoute>
                    <TicketDetails />
                  </PrivateRoute>
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
