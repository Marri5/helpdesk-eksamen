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
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-danger';
      case 'Under arbeid':
        return 'bg-warning';
      case 'Løst':
        return 'bg-success';
      default:
        return 'bg-gray-500';
    }
  };

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-danger';
      case 'Medium':
        return 'bg-warning';
      case 'Low':
        return 'bg-info';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
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
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Status:</span>
                  <span className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 rounded`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Priority:</span>
                  <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="font-semibold">Category:</span> {ticket.category}
                </div>
                <div>
                  <span className="font-semibold">Submitted By:</span> {ticket.user && ticket.user.name}
                </div>
              </div>
              {ticket.isTO && (
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Tilrettelagt Opplæring (TO) Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Year:</span> {ticket.TOYear}
                    </div>
                    <div>
                      <span className="font-semibold">Student Name:</span> {ticket.studentName}
                    </div>
                    <div>
                      <span className="font-semibold">Student Class:</span> {ticket.studentClass}
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="font-semibold">Created:</span>{' '}
                  <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
                </div>
                <div>
                  <span className="font-semibold">Last Updated:</span>{' '}
                  <Moment format="YYYY-MM-DD HH:mm">{ticket.updatedAt}</Moment>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
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
                          <span className="font-semibold mr-2">{comment.name}</span>
                          <span className="bg-info text-white text-xs px-2 py-0.5 rounded">{comment.role}</span>
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
              to={user && user.role === 'admin' ? '/admin' : '/dashboard'}
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