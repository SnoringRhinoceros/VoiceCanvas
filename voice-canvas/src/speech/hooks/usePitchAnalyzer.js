// src/components/hooks/usePitchAnalyzer.js
import { useState, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { usePitchContext } from '../../context/PitchContext';

export function usePitchAnalyzer() {
    const { setCurrentPitch, setAllPitches } = usePitchContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const frameIdRef = useRef(null);
  const startTimeRef = useRef(null);

  const newPitches = [];

  const analyzePitch = async () => {
    setError(null);
    setPitches([]);
    setIsAnalyzing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);

      const floatBuffer = new Float32Array(analyser.fftSize);
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      startTimeRef.current = audioContext.currentTime;

      const newPitches = [];

      const loop = () => {
        analyser.getFloatTimeDomainData(floatBuffer);
        const [pitch, clarity] = detector.findPitch(floatBuffer, audioContext.sampleRate);
        const time = audioContext.currentTime - startTimeRef.current;

        if (clarity > 0.9) {
          const pitchData = { time, pitch: Math.round(pitch), clarity: clarity.toFixed(2) };
          newPitches.push(pitchData);
          setCurrentPitch(Math.round(pitch));
          setAllPitches([...newPitches]);
        }

        frameIdRef.current = requestAnimationFrame(loop);
      };

      loop();

      // Stop after 10 seconds (or call stop externally if you prefer)
      setTimeout(() => {
        stopAnalysis();
      }, 10000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to access microphone');
      setIsAnalyzing(false);
    }
  };

  const stopAnalysis = () => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    setIsAnalyzing(false);
  };

  return {
    analyzePitch,
    stopAnalysis,
    pitches,
    isAnalyzing,
    error,
  };
}
