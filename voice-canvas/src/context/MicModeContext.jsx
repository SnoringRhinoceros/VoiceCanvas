// src/context/MicModeContext.jsx
import { createContext, useContext, useState } from 'react';


export const MicModeContext = createContext();

export const MicModeProvider = ({ children }) => {
  const [micMode, setMicMode] = useState('off');
  return (
    <MicModeContext.Provider value={{ micMode, setMicMode }}>
      {children}
    </MicModeContext.Provider>
  );
};

export const useMicMode = () => useContext(MicModeContext);
