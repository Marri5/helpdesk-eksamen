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
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    TO: {
      total: 0,
      firstYear: 0,
      secondYear: 0,
      resolved: 0,
      pending: 0
    },
    categories: [],
    priorities: []
  });
  const [loading, setLoading] = useState(true);
  const [statLoading, setStatLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

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

    const getUsers = async () => {
      try {
        const res = await axios.get('/users');
        setUsers(res.data.data);
        setUserLoading(false);
      } catch (err) {
        setAlert('Failed to fetch users', 'danger');
        setUserLoading(false);
      }
    };

    getTickets();
    getStats();
    getUsers();
  }, [setAlert]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      setAlert('User role updated successfully', 'success');
    } catch (err) {
      setAlert('Failed to update user role', 'danger');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <i className="fas fa-user-shield mr-2"></i> Admin Dashboard
        </h1>
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl text-primary font-semibold mb-2">Welcome {user && user.name}</h2>
          <p className="text-gray-600">Manage tickets, users, and view statistics here.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Ticket Statistics</h2>

      {statLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
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

          <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">TO Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Total TO</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.TO.total}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">1st Year</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.TO.firstYear}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">2nd Year</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.TO.secondYear}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Resolved</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.TO.resolved}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Pending</h4>
                <p className="text-2xl font-bold text-blue-600">{stats.TO.pending}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">User Management</h2>
      
      {userLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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