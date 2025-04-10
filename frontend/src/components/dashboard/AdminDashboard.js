import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import TicketItem from '../tickets/TicketItem';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    to_first_year: { total: 0, resolved: 0, closed: 0 },
    to_second_year: { total: 0, resolved: 0, closed: 0 }
  });

  const loadData = useCallback(async () => {
    try {
      console.log('Loading admin dashboard data...', { token: localStorage.getItem('token') });
      const [usersRes, ticketsRes] = await Promise.all([
        axios.get('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      console.log('Users response:', {
        status: usersRes.status,
        data: usersRes.data,
        headers: usersRes.headers
      });
      console.log('Tickets response:', {
        status: ticketsRes.status,
        data: ticketsRes.data,
        headers: ticketsRes.headers
      });

      if (!usersRes.data.data || !ticketsRes.data.data) {
        console.error('Invalid response format:', {
          users: usersRes.data,
          tickets: ticketsRes.data
        });
        throw new Error('Invalid response format from server');
      }

      setUsers(usersRes.data.data);
      setTickets(ticketsRes.data.data);

      // Calculate statistics
      const newStats = {
        to_first_year: { total: 0, resolved: 0, closed: 0 },
        to_second_year: { total: 0, resolved: 0, closed: 0 }
      };

      ticketsRes.data.data.forEach(ticket => {
        if (ticket.assignedTo) {
          const assignedUser = usersRes.data.data.find(u => u._id === ticket.assignedTo);
          if (assignedUser) {
            if (assignedUser.role === 'to_first_year') {
              newStats.to_first_year.total++;
              if (ticket.status === 'resolved') newStats.to_first_year.resolved++;
              if (ticket.status === 'closed') newStats.to_first_year.closed++;
            } else if (assignedUser.role === 'to_second_year') {
              newStats.to_second_year.total++;
              if (ticket.status === 'resolved') newStats.to_second_year.resolved++;
              if (ticket.status === 'closed') newStats.to_second_year.closed++;
            }
          }
        }
      });

      console.log('Calculated statistics:', newStats);
      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin dashboard:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || error.message || 'Error loading data';
      setAlert(errorMessage, 'error');
      setLoading(false);
    }
  }, [setAlert]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setAlert('Unauthorized access', 'error');
      // You might want to redirect non-admin users here
    }
  }, [loadData, user, setAlert]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}`, 
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setAlert('User role updated successfully', 'success');
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating user role:', error);
      const errorMessage = error.response?.data?.message || 'Error updating user role';
      setAlert(errorMessage, 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      <h2 className="text-xl font-bold mb-4">TO Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">1st Year TOs</h3>
          <div className="space-y-2">
            <p>Total Tickets: {stats.to_first_year.total}</p>
            <p>Resolved: {stats.to_first_year.resolved}</p>
            <p>Closed: {stats.to_first_year.closed}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">2nd Year TOs</h3>
          <div className="space-y-2">
            <p>Total Tickets: {stats.to_second_year.total}</p>
            <p>Resolved: {stats.to_second_year.resolved}</p>
            <p>Closed: {stats.to_second_year.closed}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
            {users.map(user => (
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
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="to_first_year">1st Year TO</option>
                    <option value="to_second_year">2nd Year TO</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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