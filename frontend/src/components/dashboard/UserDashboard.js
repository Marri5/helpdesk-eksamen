import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import TicketItem from '../tickets/TicketItem';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTickets = async () => {
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

    getTickets();
  }, [setAlert]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <i className="fas fa-user mr-2"></i> User Dashboard
        </h1>
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl text-primary font-semibold mb-2">Welcome {user && user.name}</h2>
          <p className="text-gray-600 mb-4">You can submit new tickets and check the status of your tickets here.</p>
          <Link 
            to="/tickets/new" 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Submit New Ticket
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Tickets</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <TicketItem ticket={ticket} />
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
                >
                  <i className="fas fa-eye mr-2"></i> View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p>You don't have any tickets yet. Create a new one!</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 