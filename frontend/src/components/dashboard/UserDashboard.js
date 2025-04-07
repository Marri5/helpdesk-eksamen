import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
        const res = await axios.get('/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setAlert('Failed to fetch tickets', 'danger');
        setLoading(false);
      }
    };

    getTickets();
  }, [setAlert]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h1 className="my-4">
            <i className="fas fa-user"></i> User Dashboard
          </h1>
          <div className="bg-light p-4 mb-4 rounded">
            <h2 className="text-primary">Welcome {user && user.name}</h2>
            <p>You can submit new tickets and check the status of your tickets here.</p>
            <Link to="/tickets/new" className="btn btn-primary my-1">
              <i className="fas fa-plus"></i> Submit New Ticket
            </Link>
          </div>

          <h2 className="my-4">Your Tickets</h2>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <TicketItem key={ticket._id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              You don't have any tickets yet. Create a new one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 