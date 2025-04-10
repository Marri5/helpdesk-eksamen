import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  const [availableTOs, setAvailableTOs] = useState([]);

  const loadTicket = useCallback(async () => {
    try {
      const res = await axios.get(`/api/tickets/${id}`);
      setTicket(res.data.data);
      setStatus(res.data.data.status);
      setPriority(res.data.data.priority);
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch ticket details', 'danger');
      navigate('/dashboard');
    }
  }, [id, setAlert, navigate]);

  const loadTOs = useCallback(async () => {
    try {
      const res = await axios.get('/api/users');
      const tos = res.data.data.filter(u => 
        u.role === 'to_first_year' || u.role === 'to_second_year'
      );
      setAvailableTOs(tos);
    } catch (error) {
      setAlert('Error loading TOs', 'error');
    }
  }, [setAlert]);

  useEffect(() => {
    loadTicket();
    if (user?.role === 'admin') {
      loadTOs();
    }
  }, [loadTicket, loadTOs, user?.role]);

  const onCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText === '') {
      setAlert('Please enter a comment', 'danger');
      return;
    }

    try {
      const res = await axios.post(`/api/tickets/${id}/comments`, { text: commentText });
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
      const res = await axios.put(`/api/tickets/${id}`, { status });
      setTicket(res.data.data);
      setAlert('Ticket status updated successfully', 'success');
    } catch (err) {
      setAlert('Failed to update ticket status', 'danger');
    }
  };

  const onPriorityChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/tickets/${id}`, { priority });
      setTicket(res.data.data);
      setAlert('Ticket priority updated successfully', 'success');
    } catch (err) {
      setAlert('Failed to update ticket priority', 'danger');
    }
  };

  const handleAssignTO = async (toId) => {
    try {
      await axios.put(`/api/tickets/${id}`, { assignedTo: toId });
      setAlert('Ticket assigned successfully', 'success');
      loadTicket();
    } catch (error) {
      setAlert(error.response?.data?.message || 'Error assigning ticket', 'error');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/api/tickets/${id}`, { status: newStatus });
      setAlert('Ticket status updated successfully', 'success');
      loadTicket();
    } catch (error) {
      setAlert(error.response?.data?.message || 'Error updating ticket status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>Ticket not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-primary text-white p-4">
            <h2 className="text-xl font-bold">{ticket.title}</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <p className="text-sm text-gray-500">
                  Submitted by {ticket.submitter?.name || 'Unknown'} on{' '}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
              {(user?.role === 'admin' || user?.role?.startsWith('to_')) && (
                <div className="flex space-x-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  {user?.role === 'admin' && (
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={ticket.assignedTo || ''}
                      onChange={(e) => handleAssignTO(e.target.value)}
                    >
                      <option value="">Assign TO</option>
                      {availableTOs.map(to => (
                        <option key={to._id} value={to._id}>
                          {to.name} ({to.role === 'to_first_year' ? '1st Year' : '2nd Year'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="font-semibold">Category:</span> {ticket.category}
              </div>
              <div>
                <span className="font-semibold">Priority:</span> {ticket.priority}
              </div>
              <div>
                <span className="font-semibold">Subject:</span> {ticket.subject}
              </div>
              <div>
                <span className="font-semibold">Year of Study:</span> {ticket.yearOfStudy}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description:</h3>
              <p className="text-gray-700">{ticket.description}</p>
            </div>

            {user && user.role === 'admin' && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form onSubmit={onStatusChange} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Change Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="bg-primary text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                    >
                      Update Status
                    </button>
                  </form>
                  <form onSubmit={onPriorityChange} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Change Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="bg-primary text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                    >
                      Update Priority
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Comments ({ticket.comments.length})</h3>
              <form onSubmit={onCommentSubmit} className="mb-6">
                <div className="mb-3">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    rows="3"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Post Comment
                </button>
              </form>

              <div className="space-y-4">
                {ticket.comments.length > 0 ? (
                  ticket.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{comment.user?.name || 'Unknown'}</span>
                          <span className="bg-info text-white text-xs px-2 py-0.5 rounded">{comment.user?.role || 'User'}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          <Moment format="YYYY-MM-DD HH:mm">{comment.createdAt}</Moment>
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <Link
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails; 