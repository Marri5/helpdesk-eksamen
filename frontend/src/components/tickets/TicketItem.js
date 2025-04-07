import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

const TicketItem = ({ ticket, isAdmin }) => {
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

  return (
    <div className="card mb-3">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Link to={`/tickets/${ticket._id}`}>{ticket.title}</Link>
          </h5>
          <div>
            <span className={`badge badge-${getStatusBadgeColor(ticket.status)} mr-2`}>
              {ticket.status}
            </span>
            <span className={`badge badge-${getPriorityBadgeColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <p className="card-text">{ticket.description.substring(0, 100)}...</p>
        <div className="ticket-meta d-flex justify-content-between">
          <small className="text-muted">
            Category: {ticket.category}
          </small>
          <small className="text-muted">
            Created: <Moment format="YYYY-MM-DD HH:mm">{ticket.createdAt}</Moment>
          </small>
        </div>
        {isAdmin && ticket.user && (
          <small className="text-muted d-block mt-1">
            Submitted by: {ticket.user.name}
          </small>
        )}
      </div>
      <div className="card-footer bg-white">
        <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-primary">
          View Details
        </Link>
        {ticket.comments && ticket.comments.length > 0 && (
          <span className="badge badge-pill badge-secondary ml-2">
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