import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Moment from 'react-moment';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    const getTicket = async () => {
      try {
        const res = await axios.get(`/tickets/${id}`);
        setTicket(res.data.data);
        setStatus(res.data.data.status);
        setPriority(res.data.data.priority);
        setLoading(false);
      } catch (err) {
        setAlert('Failed to fetch ticket details', 'danger');
        navigate('/dashboard');
      }
    };

    getTicket();
  }, [id, setAlert, navigate]);

  const onCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText === '') {
      setAlert('Please enter a comment', 'danger');
      return;
    }

    try {
      const res = await axios.post(`/tickets/${id}/comments`, { text: commentText });
      setTicket({ ...ticket, comments: res.data.data });
      setCommentText('');
      setAlert('Comment added successfully', 'success');
    } catch (err) {
      setAlert('Failed to add comment', 'danger');
    }
  };

  const onStatusChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/tickets/${id}`, { status });
      setTicket(res.data.data);
      setAlert('Ticket status updated successfully', 'success');
    } catch (err) {
      setAlert('Failed to update ticket status', 'danger');
    }
  };

  const onPriorityChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/tickets/${id}`, { priority });
      setTicket(res.data.data);
      setAlert('Ticket priority updated successfully', 'success');
    } catch (err) {
      setAlert('Failed to update ticket priority', 'danger');
    }
  };

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Open':
        return 'danger';
      case 'Under arbeid':
        return 'warning';
      case 'Løst':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{ticket.title}</h4>
            </div>
            <div className="card-body">
              <div className="ticket-details mb-4">
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Status:</strong>{' '}
                    <span className={`badge badge-${getStatusBadgeColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Priority:</strong>{' '}
                    <span className={`badge badge-${getPriorityBadgeColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Category:</strong> {ticket.category}
                  </div>
                  <div className="col-md-6">
                    <strong>Submitted By:</strong> {ticket.user && ticket.user.name}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>Created:</strong>{' '}
                    <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
                  </div>
                  <div className="col-md-6">
                    <strong>Last Updated:</strong>{' '}
                    <Moment format="YYYY-MM-DD HH:mm">{ticket.updatedAt}</Moment>
                  </div>
                </div>
                <hr />
                <h5>Description:</h5>
                <p>{ticket.description}</p>
              </div>

              {user && user.role === 'admin' && (
                <div className="admin-controls mb-4">
                  <h5>Admin Controls</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <form onSubmit={onStatusChange}>
                        <div className="form-group">
                          <label>Change Status</label>
                          <select
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="Under arbeid">Under arbeid</option>
                            <option value="Løst">Løst</option>
                          </select>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">
                          Update Status
                        </button>
                      </form>
                    </div>
                    <div className="col-md-6">
                      <form onSubmit={onPriorityChange}>
                        <div className="form-group">
                          <label>Change Priority</label>
                          <select
                            className="form-control"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">
                          Update Priority
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="comments-section">
                <h5 className="mb-3">Comments ({ticket.comments.length})</h5>
                <form onSubmit={onCommentSubmit} className="mb-4">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Post Comment
                  </button>
                </form>

                <div className="comment-list">
                  {ticket.comments.length > 0 ? (
                    ticket.comments.map((comment, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <strong>{comment.name}</strong>{' '}
                              <span className="badge badge-info">{comment.role}</span>
                            </div>
                            <small className="text-muted">
                              <Moment format="YYYY-MM-DD HH:mm">{comment.createdAt}</Moment>
                            </small>
                          </div>
                          <p className="mb-0">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert alert-info">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <Link
                to={user && user.role === 'admin' ? '/admin' : '/dashboard'}
                className="btn btn-secondary"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails; 