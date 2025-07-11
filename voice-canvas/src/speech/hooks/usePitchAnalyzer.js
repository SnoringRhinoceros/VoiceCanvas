// src/hooks/usePitchAnalyzer.js
import { useState } from 'react';
import { PitchDetector } from 'pitchy';

export function usePitchAnalyzer() {
  const [pitches, setPitches] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzePitch = async (filePath = '/recordings/test_recording.webm') => {
    setIsAnalyzing(true);
    setError(null);
    setPitches([]);

    try {
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0); // first channel

      const frameSize = 1024;
      const hopSize = 512;

      const detector = PitchDetector.forFloat32Array(frameSize);
      const results = [];

      for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
        const frame = channelData.slice(i, i + frameSize);
        const [pitch, clarity] = detector.findPitch(frame, sampleRate);

        if (clarity > 0.9) {
          results.push({ time: i / sampleRate, pitch: pitch.toFixed(2), clarity: clarity.toFixed(2) });
        }
      }

      setPitches(results);
    } catch (err) {
      setError(err.message || 'Pitch analysis failed');
    }

    setIsAnalyzing(false);
  };

  return { analyzePitch, pitches, isAnalyzing, error };
}
