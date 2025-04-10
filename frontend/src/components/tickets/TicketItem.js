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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">
              <Link to={`/tickets/${ticket._id}`} className="text-primary hover:text-blue-700">
                {ticket.title}
              </Link>
            </h3>
            {ticket.isTO && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                TO - Year {ticket.TOYear}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <span className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
            <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 mb-3">
          {ticket.description.substring(0, 100)}
          {ticket.description.length > 100 && '...'}
        </p>
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Category: {ticket.category}</span>
            <span>
              Created: <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
            </span>
          </div>
          {ticket.isTO && (
            <div className="text-sm text-gray-500">
              <span>Student: {ticket.studentName} | Class: {ticket.studentClass}</span>
            </div>
          )}
          {ticket.assignedTo && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold">Assigned to:</span>{' '}
              {ticket.assignedTo.name} ({ticket.supportLevel})
            </div>
          )}
          {ticket.comments && ticket.comments.length > 0 && (
            <div className="text-sm text-gray-500">
              <i className="fas fa-comment-alt mr-1"></i>
              {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <Link 
          to={`/tickets/${ticket._id}`} 
          className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          View Details
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
  );
};

TicketItem.propTypes = {
  ticket: PropTypes.object.isRequired,
  showEscalate: PropTypes.bool,
  onEscalate: PropTypes.func
};

export default TicketItem; 