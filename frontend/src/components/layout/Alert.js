import React, { useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';

const Alert = () => {
  const { alerts } = useContext(AlertContext);

  // Map alert types to Tailwind classes
  const alertTypeClasses = {
    danger: 'bg-danger',
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info'
  };

  return (
    <div className="alert-wrapper">
      {alerts.length > 0 &&
        alerts.map(alert => (
          <div
            key={alert.id}
            className={`${alertTypeClasses[alert.type] || 'bg-gray-500'} text-white p-3 mb-4 rounded shadow-md`}
          >
            {alert.msg}
          </div>
        ))}
    </div>
  );
};

export default Alert; 