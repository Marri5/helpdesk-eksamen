import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const TicketItem = ({ ticket, showEscalate, onEscalate }) => {
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

  // Calculate if there are unread responses (comments after user's last comment)
  const hasUnreadResponses = () => {
    if (!ticket.comments || ticket.comments.length === 0) return false;
    
    // If there are no user comments, and there are support comments, show as unread
    const userComments = ticket.comments.filter(c => c.user._id === ticket.user._id);
    if (userComments.length === 0 && ticket.comments.length > 0) return true;
    
    // Get the timestamp of user's last comment
    const lastUserComment = userComments[0]?.createdAt;
    if (!lastUserComment) return false;
    
    // Check if there are any support comments after user's last comment
    return ticket.comments.some(c => 
      c.user._id !== ticket.user._id && 
      new Date(c.createdAt) > new Date(lastUserComment)
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <h3 className="text-lg font-semibold">
              <Link to={`/tickets/${ticket._id}`} className="text-primary hover:text-blue-700">
                {ticket.title}
              </Link>
              {hasUnreadResponses() && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  New Response
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.status === 'in_progress' ? 'In Progress' : 
               ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
            <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-700">
          {ticket.description.substring(0, 100)}
          {ticket.description.length > 100 && '...'}
        </p>
        
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500">
            <span>Category: {ticket.category}</span>
            <span>
              Created: <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
            </span>
          </div>
          {ticket.assignedTo && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold">Assigned to:</span>{' '}
              {ticket.assignedTo.name} ({ticket.supportLevel})
            </div>
          )}
        </div>
        
        {ticket.comments && ticket.comments.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 mb-1">
              <div className="flex items-center mb-1 sm:mb-0">
                <i className="fas fa-comment-alt mr-1"></i>
                <span>Latest update from {ticket.comments[0].user.name}</span>
              </div>
              <Moment fromNow>{ticket.comments[0].createdAt}</Moment>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{ticket.comments[0].text}</p>
            {ticket.comments.length > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                +{ticket.comments.length - 1} more {ticket.comments.length - 1 === 1 ? 'comment' : 'comments'}
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Link 
            to={`/tickets/${ticket._id}`} 
            className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <span>View & Respond</span>
            {hasUnreadResponses() && (
              <span className="ml-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </Link>
          {showEscalate && ticket.status !== 'escalated' && ticket.supportLevel !== 'secondline' && (
            <button
              onClick={onEscalate}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Escalate to 2nd Line
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

TicketItem.propTypes = {
  ticket: PropTypes.object.isRequired,
  showEscalate: PropTypes.bool,
  onEscalate: PropTypes.func
};

export default TicketItem; 