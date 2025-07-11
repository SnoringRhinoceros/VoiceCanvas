// src/context/PitchContext.js
import React, { createContext, useContext, useState } from 'react';

const PitchContext = createContext();

export const PitchProvider = ({ children }) => {
  const [currentPitch, setCurrentPitch] = useState(null);
  const [allPitches, setAllPitches] = useState([]); // optional: full history

  return (
    <PitchContext.Provider value={{ currentPitch, setCurrentPitch, allPitches, setAllPitches }}>
      {children}
    </PitchContext.Provider>
  );
};

export const usePitchContext = () => useContext(PitchContext);
