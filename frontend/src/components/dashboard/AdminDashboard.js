import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import TicketItem from '../tickets/TicketItem';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    support: {
      total: 0,
      firstline: 0,
      secondline: 0,
      resolved: 0,
      escalated: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [statLoading, setStatLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const [filterOptions, setFilterOptions] = useState({
    status: '',
    priority: '',
    supportLevel: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      setAlert('Not authorized to access admin dashboard', 'danger');
      return;
    }

    const fetchData = async () => {
      try {
        const [ticketsRes, statsRes, usersRes] = await Promise.all([
          axiosInstance.get('/tickets'),
          axiosInstance.get('/tickets/stats'),
          axiosInstance.get('/users')
        ]);

        setTickets(ticketsRes.data.data || []);
        setStats(statsRes.data.data || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          support: {
            total: 0,
            firstline: 0,
            secondline: 0,
            resolved: 0,
            escalated: 0
          }
        });
        setUsers(usersRes.data.data || []);

        setLoading(false);
        setStatLoading(false);
        setUserLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setAlert('Failed to fetch dashboard data', 'danger');
        }
        setLoading(false);
        setStatLoading(false);
        setUserLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate, setAlert]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axiosInstance.put(`/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: newRole } : u
        ));
        setAlert('User role updated successfully', 'success');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setAlert('User not found', 'danger');
      } else if (err.response?.status === 400) {
        setAlert(err.response.data.msg || 'Invalid role value', 'danger');
      } else {
        setAlert('Failed to update user role. Please try again.', 'danger');
      }
    }
  };

  const handleAssignTicket = async (ticketId, userId, supportLevel) => {
    try {
      const res = await axiosInstance.put(`/tickets/${ticketId}/assign`, {
        assignedTo: userId,
        supportLevel
      });
      if (res.data.success) {
        setTickets(tickets.map(t =>
          t._id === ticketId ? { ...t, assignedTo: userId, supportLevel } : t
        ));
        setAlert('Ticket assigned successfully', 'success');
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setAlert(err.response?.data?.msg || 'Failed to assign ticket', 'danger');
    }
  };

  const filterTickets = (tickets) => {
    return tickets.filter(ticket => {
      if (filterOptions.status && ticket.status !== filterOptions.status) return false;
      if (filterOptions.priority && ticket.priority !== filterOptions.priority) return false;
      if (filterOptions.supportLevel && ticket.supportLevel !== filterOptions.supportLevel) return false;
      if (filterOptions.assignedTo && ticket.assignedTo !== filterOptions.assignedTo) return false;
      return true;
    });
  };

  if (loading && statLoading && userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
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
          <h2 className="text-xl text-primary font-semibold mb-2">Welcome {user?.name}</h2>
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
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </div>
            <div className="bg-danger text-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Open</h3>
              <p className="text-3xl font-bold">{stats?.open || 0}</p>
            </div>
            <div className="bg-warning text-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">In Progress</h3>
              <p className="text-3xl font-bold">{stats?.inProgress || 0}</p>
            </div>
            <div className="bg-success text-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Resolved</h3>
              <p className="text-3xl font-bold">{stats?.resolved || 0}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Support Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Total Support Staff</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.support?.total || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">First-line</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.support?.firstline || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Second-line</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.support?.secondline || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Resolved</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.support?.resolved || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-800">Escalated</h4>
                <p className="text-2xl font-bold text-blue-600">{stats?.support?.escalated || 0}</p>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'firstline' || user.role === 'secondline' ? 'bg-green-100 text-green-800' :
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'firstline' ? 'First-line Support' :
                       user.role === 'secondline' ? 'Second-line Support' :
                       user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                      <option value="firstline">First-line Support</option>
                      <option value="secondline">Second-line Support</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">All Tickets</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={filterOptions.status}
          onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={filterOptions.priority}
          onChange={(e) => setFilterOptions({...filterOptions, priority: e.target.value})}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={filterOptions.supportLevel}
          onChange={(e) => setFilterOptions({...filterOptions, supportLevel: e.target.value})}
        >
          <option value="">All Support Levels</option>
          <option value="firstline">First-line Support</option>
          <option value="secondline">Second-line Support</option>
        </select>

        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={filterOptions.assignedTo}
          onChange={(e) => setFilterOptions({...filterOptions, assignedTo: e.target.value})}
        >
          <option value="">All Assignees</option>
          {users
            .filter(u => u.role === 'firstline' || u.role === 'secondline')
            .map(support => (
              <option key={support._id} value={support._id}>
                {support.name} ({support.role === 'firstline' ? 'First-line' : 'Second-line'})
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filterTickets(tickets).length > 0 ? (
        <div className="space-y-4">
          {filterTickets(tickets).map((ticket) => (
            <div key={ticket._id} className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="mb-4 md:mb-0">
                    <TicketItem ticket={ticket} isAdmin={true} />
                  </div>
                  <div className="w-full md:w-64">
                    <select
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      onChange={(e) => {
                        const [userId, supportLevel] = e.target.value.split('|');
                        handleAssignTicket(ticket._id, userId, supportLevel);
                      }}
                      value={ticket.assignedTo ? `${ticket.assignedTo}|${ticket.supportLevel}` : ""}
                    >
                      <option value="">Assign Support</option>
                      {users
                        .filter(u => u.role === 'firstline' || u.role === 'secondline')
                        .map((support) => (
                          <option 
                            key={support._id} 
                            value={`${support._id}|${support.role}`}
                          >
                            {support.name} ({support.role === 'firstline' ? 'First-line' : 'Second-line'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
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