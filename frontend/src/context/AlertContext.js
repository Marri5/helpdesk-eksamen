import React, { createContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  const setAlert = useCallback((msg, type, timeout = 5000) => {
    const id = uuidv4();
    
    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.length >= 3 
        ? [...prevAlerts.slice(1), { msg, type, id }] 
        : [...prevAlerts, { msg, type, id }];
      
      return updatedAlerts;
    });

    setTimeout(() => removeAlert(id), timeout);
  }, [removeAlert]);

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