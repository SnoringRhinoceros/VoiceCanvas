// src/context/CommandContext.jsx
import { createContext, useContext, useCallback, useState } from 'react';

const CommandContext = createContext();

export function CommandProvider({ children }) {
  const [log, setLog] = useState([]);
  const subscribers = [];

  const sendCommand = (command) => {
    // Add to history
    setLog((prev) => [...prev.slice(-9), { command, time: new Date() }]);
    // Notify subscribers
    subscribers.forEach((fn) => fn(command));
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
    return () => {
      const i = subscribers.indexOf(fn);
      if (i > -1) subscribers.splice(i, 1);
    };
  };

  return (
    <CommandContext.Provider value={{ sendCommand, subscribe, log }}>
      {children}
    </CommandContext.Provider>
  );
}

export const useCommandBus = () => useContext(CommandContext);
