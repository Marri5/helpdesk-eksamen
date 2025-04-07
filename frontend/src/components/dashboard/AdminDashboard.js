import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import TicketItem from '../tickets/TicketItem';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    categories: [],
    priorities: []
  });
  const [loading, setLoading] = useState(true);
  const [statLoading, setStatLoading] = useState(true);

  useEffect(() => {
    const getTickets = async () => {
      try {
        const res = await axios.get('/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setAlert('Failed to fetch tickets', 'danger');
        setLoading(false);
      }
    };

    const getStats = async () => {
      try {
        const res = await axios.get('/tickets/stats');
        setStats(res.data.data);
        setStatLoading(false);
      } catch (err) {
        setAlert('Failed to fetch statistics', 'danger');
        setStatLoading(false);
      }
    };

    getTickets();
    getStats();
  }, [setAlert]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <i className="fas fa-user-shield mr-2"></i> Admin Dashboard
        </h1>
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl text-primary font-semibold mb-2">Welcome {user && user.name}</h2>
          <p className="text-gray-600">Manage tickets and view statistics here.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Ticket Statistics</h2>

      {statLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary text-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Tickets</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-danger text-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Open</h3>
            <p className="text-3xl font-bold">{stats.open}</p>
          </div>
          <div className="bg-warning text-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-success text-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Resolved</h3>
            <p className="text-3xl font-bold">{stats.resolved}</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">All Tickets</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketItem key={ticket._id} ticket={ticket} isAdmin={true} />
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p>There are no tickets in the system yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 