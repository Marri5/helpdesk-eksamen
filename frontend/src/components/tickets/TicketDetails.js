import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../config/axios';
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
        const res = await axiosInstance.get(`/tickets/${id}`);
        setTicket(res.data.data);
        setStatus(res.data.data.status);
        setPriority(res.data.data.priority);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setAlert(err.response?.data?.msg || 'Failed to fetch ticket details', 'danger');
        navigate('/dashboard');
      }
    };

    getTicket();
  }, [id, setAlert, navigate]);

  const onCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim() === '') {
      setAlert('Please enter a comment', 'danger');
      return;
    }

    try {
      const res = await axiosInstance.post(`/tickets/${id}/comments`, { text: commentText });
      setTicket(res.data.data);
      setCommentText('');
      setAlert('Comment added successfully', 'success');
    } catch (err) {
      console.error('Error adding comment:', err);
      setAlert(err.response?.data?.msg || 'Failed to add comment', 'danger');
    }
  };

  const onStatusChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/tickets/${id}`, { status });
      setTicket(res.data.data);
      setAlert('Ticket status updated successfully', 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      setAlert(err.response?.data?.msg || 'Failed to update ticket status', 'danger');
    }
  };

  const onPriorityChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/tickets/${id}`, { priority });
      setTicket(res.data.data);
      setAlert('Ticket priority updated successfully', 'success');
    } catch (err) {
      console.error('Error updating priority:', err);
      setAlert(err.response?.data?.msg || 'Failed to update ticket priority', 'danger');
    }
  };

  const handleSelfAssign = async () => {
    try {
      const res = await axiosInstance.put(`/tickets/${id}/assign`, {
        assignedTo: user._id,
        supportLevel: user.role
      });
      setTicket(res.data.data);
      setAlert('Ticket assigned to you successfully', 'success');
    } catch (err) {
      console.error('Error self-assigning ticket:', err);
      setAlert(err.response?.data?.msg || 'Failed to assign ticket', 'danger');
    }
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'escalated':
        return 'bg-red-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
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
                    {ticket.status === 'in_progress' ? 'In Progress' : 
                     ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
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

              {user && (user.role === 'firstline' || user.role === 'secondline') && !ticket.assignedTo && (
                <div className="mb-6">
                  <button
                    onClick={handleSelfAssign}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  >
                    Assign to Myself
                  </button>
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

            {/* Comments and Updates Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Updates & Comments</h3>
              
              {/* Comment Form */}
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

              {/* Timeline of Updates and Comments */}
              <div className="space-y-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      comment.user._id === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-500'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{comment.user.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            comment.user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            comment.user.role.includes('line') ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.user.role === 'firstline' ? 'First-line Support' :
                             comment.user.role === 'secondline' ? 'Second-line Support' :
                             comment.user.role.charAt(0).toUpperCase() + comment.user.role.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          <Moment fromNow>{comment.createdAt}</Moment>
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                    <p>No updates yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
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
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="escalated">Escalated</option>
                        <option value="resolved">Resolved</option>
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
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
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
    </div>
  );
};

export default TicketDetails; 