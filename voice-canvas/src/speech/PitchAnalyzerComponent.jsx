// src/speech/PitchAnalyzerComponent.jsx
import React from 'react';
import { usePitchAnalyzer } from './hooks/usePitchAnalyzer';

export default function PitchAnalyzerComponent() {
  const { analyzePitch, pitches, isAnalyzing, error } = usePitchAnalyzer();

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

  return (
    <div className="p-4">
      <button
        onClick={() => analyzePitch()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Recording...' : 'Record Pitch'}
      </button>

      <button
        onClick={downloadResults}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={pitches.length === 0}
      >
        Download CSV
      </button>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {false && pitches.length > 0 && (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <h2 className="font-bold mb-2">Detected Pitches:</h2>
          <ul className="text-sm font-mono">
            {pitches.map((p, i) => (
              <li key={i}>
                t={p.time.toFixed(2)}s: pitch={p.pitch} Hz (clarity={p.clarity})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}