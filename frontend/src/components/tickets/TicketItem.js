import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const TicketItem = ({ ticket, isAdmin }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            <Link to={`/tickets/${ticket._id}`} className="text-primary hover:text-blue-700">
              {ticket.title}
            </Link>
          </h3>
          <div className="flex space-x-2">
            <span className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.status}
            </span>
            <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded`}>
              {ticket.priority}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 mb-3">
          {ticket.description.substring(0, 100)}
          {ticket.description.length > 100 && '...'}
        </p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Category: {ticket.category}</span>
          <span>
            Created: <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
          </span>
        </div>
        {isAdmin && ticket.user && (
          <div className="mt-1 text-sm text-gray-500">
            Submitted by: {ticket.user.name}
          </div>
        )}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <Link 
          to={`/tickets/${ticket._id}`} 
          className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          View Details
        </Link>
        {ticket.comments && ticket.comments.length > 0 && (
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {ticket.comments.length} comments
          </span>
        )}
      </div>
    </div>
  );
};

TicketItem.propTypes = {
  ticket: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool
};

TicketItem.defaultProps = {
  isAdmin: false
};

export default TicketItem; 