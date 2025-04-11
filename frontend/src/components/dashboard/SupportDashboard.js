import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import TicketItem from '../tickets/TicketItem';

const SupportDashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    status: '',
    priority: '',
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axiosInstance.get('/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setAlert(err.response?.data?.msg || 'Failed to fetch tickets', 'danger');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [setAlert]);

  const filterTickets = (tickets) => {
    return tickets.filter(ticket => {
      if (filterOptions.status && ticket.status !== filterOptions.status) {
        return false;
      }
      if (filterOptions.priority && ticket.priority !== filterOptions.priority) {
        return false;
      }

      if (user.role === 'firstline') {
        if (ticket.status === 'escalated' || ticket.supportLevel === 'secondline') {
          return false;
        }

        return (
          (!ticket.assignedTo && ticket.status === 'new') ||
          ticket.assignedTo?._id === user._id ||
          ticket.supportLevel === 'firstline'
        );
      }
      
      if (user.role === 'secondline') {
        return (
          ticket.status === 'escalated' ||
          ticket.assignedTo?._id === user._id ||
          ticket.supportLevel === 'secondline'
        );
      }

      return false;
    });
  };

  const handleEscalateTicket = async (ticketId) => {
    try {
      const res = await axiosInstance.put(`/tickets/${ticketId}`, {
        status: 'escalated',
        supportLevel: 'secondline'
      });
      
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? res.data.data : ticket
      ));
      
      setAlert('Ticket escalated to second-line support', 'success');
    } catch (err) {
      console.error('Error escalating ticket:', err);
      setAlert(err.response?.data?.msg || 'Failed to escalate ticket', 'danger');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <i className="fas fa-headset mr-2"></i> 
          {user.role === 'firstline' ? 'First-line Support Dashboard' : 'Second-line Support Dashboard'}
        </h1>
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl text-primary font-semibold mb-2">Welcome {user.name}</h2>
          <p className="text-gray-600">
            {user.role === 'firstline' 
              ? 'Handle incoming tickets and escalate complex issues to second-line support.'
              : 'Handle escalated tickets and provide advanced technical support.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Tickets */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filterTickets(tickets).length > 0 ? (
        <div className="space-y-4">
          {filterTickets(tickets).map((ticket) => (
            <div key={ticket._id} className="relative">
              <TicketItem 
                ticket={ticket} 
                showEscalate={user.role === 'firstline'} 
                onEscalate={() => handleEscalateTicket(ticket._id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p>No tickets found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard; 