// src/speech/MicModeToggle.jsx

import { useEffect } from 'react';
import { useMicMode } from '../context/MicModeContext';

const MIC_MODES = ['off', 'drawing', 'command'];

export default function MicModeToggle() {
  const { micMode, setMicMode } = useMicMode();

  const cycleMode = () => {
    const nextIndex = (MIC_MODES.indexOf(micMode) + 1) % MIC_MODES.length;
    setMicMode(MIC_MODES[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        cycleMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [micMode]);

  return (
    <button
      onClick={cycleMode}
      className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
    >
      🎙️ Mode: {micMode.toUpperCase()}
    </button>
  );
}
