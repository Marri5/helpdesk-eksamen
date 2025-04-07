import React, { createContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Set Alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = uuidv4();
    setAlerts([...alerts, { msg, type, id }]);

    setTimeout(() => removeAlert(id), timeout);
  };

  // Remove Alert
  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        setAlert,
        removeAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}; 