// src/context/CommandContext.jsx
import { createContext, useContext, useCallback } from 'react';

const CommandContext = createContext();

export function CommandProvider({ children }) {
  const subscribers = [];

  const sendCommand = (command) => {
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
    <CommandContext.Provider value={{ sendCommand, subscribe }}>
      {children}
    </CommandContext.Provider>
  );
}

export const useCommandBus = () => useContext(CommandContext);
