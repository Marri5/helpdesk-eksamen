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
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h1 className="my-4">
            <i className="fas fa-user-shield"></i> Admin Dashboard
          </h1>
          <div className="bg-light p-4 mb-4 rounded">
            <h2 className="text-primary">Welcome {user && user.name}</h2>
            <p>Manage tickets and view statistics here.</p>
          </div>

          <h2 className="my-4">Ticket Statistics</h2>

          {statLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">Total Tickets</h5>
                    <h2>{stats.total}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">Open</h5>
                    <h2>{stats.open}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card bg-warning text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">In Progress</h5>
                    <h2>{stats.inProgress}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">Resolved</h5>
                    <h2>{stats.resolved}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 className="my-4">All Tickets</h2>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <TicketItem key={ticket._id} ticket={ticket} isAdmin={true} />
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              There are no tickets in the system yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 