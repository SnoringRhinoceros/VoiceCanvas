// src/context/CommandContext.jsx
import { createContext, useContext, useRef, useState } from 'react';

const CommandContext = createContext();

export function CommandProvider({ children }) {
  const [log, setLog] = useState([]);
  const subscribersRef = useRef([]);

  const sendCommand = (command) => {
    // Add to command history
    setLog((prev) => [...prev.slice(-9), { ...command, time: new Date() }]);

    // Notify all subscribers
    subscribersRef.current.forEach((fn) => {
      try {
        fn(command);
      } catch (err) {
        console.error('Error running command subscriber:', err);
      }
    });
  };

  const subscribe = (fn) => {
    subscribersRef.current.push(fn);
    console.log('📌 Subscribed to CommandBus');

    return () => {
      const index = subscribersRef.current.indexOf(fn);
      if (index !== -1) {
        subscribersRef.current.splice(index, 1);
        console.log('🧹 Unsubscribed from CommandBus');
      }
    };
  };

  return (
    <CommandContext.Provider value={{ sendCommand, subscribe, log }}>
      {children}
    </CommandContext.Provider>
  );
}

export const useCommandBus = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommandBus must be used within a CommandProvider');
  }
  return context;
};
