import React, { useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';

const Alert = () => {
  const { alerts, removeAlert } = useContext(AlertContext);

  // Map alert types to Tailwind classes
  const alertTypeClasses = {
    danger: 'bg-danger',
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info'
  };

  if (alerts.length === 0) return null;

  return (
    <div className="alert-wrapper">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`${alertTypeClasses[alert.type] || 'bg-gray-500'} text-white p-3 mb-4 rounded shadow-md relative`}
        >
          <button 
            onClick={() => removeAlert(alert.id)} 
            className="absolute top-1 right-2 text-white focus:outline-none"
            aria-label="Close alert"
          >
            &times;
          </button>
          <div className="pr-6">
            {alert.msg}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alert; 