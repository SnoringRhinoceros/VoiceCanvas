import React, { useEffect } from 'react';
import { usePitchAnalyzer } from './hooks/usePitchAnalyzer';
import { useMicMode } from '../context/MicModeContext';

export default function PitchAnalyzerComponent() {
  const { micMode } = useMicMode();
  const {
    analyzePitch,
    stopAnalysis,
    pitches,
    isAnalyzing,
    error,
  } = usePitchAnalyzer();

  // Effect only runs when micMode changes
  useEffect(() => {
    if (micMode === 'drawing' && !isAnalyzing) {
      analyzePitch();
    } else if (micMode !== 'drawing' && isAnalyzing) {
      stopAnalysis();
    }
  }, [micMode]); // ONLY micMode should be in deps

  const downloadResults = () => {
    if (pitches.length === 0) return;

    const csvContent = [
      'time (s),pitch (Hz),clarity',
      ...pitches.map(p => `${p.time.toFixed(2)},${p.pitch},${p.clarity}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitch_analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (micMode !== 'drawing') return null;

  return (
    <div className="p-4">
      <button
        onClick={downloadResults}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={pitches.length === 0}
      >
        Download CSV
      </button>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}
    </div>
  );
}
