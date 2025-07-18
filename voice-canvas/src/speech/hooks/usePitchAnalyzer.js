// src/speech/hooks/usePitchAnalyzer.js
import { useState, useRef } from 'react';
import { PitchDetector } from 'pitchy';
import { usePitchContext } from '../../context/PitchContext';
import { useSelector } from 'react-redux';

export function usePitchAnalyzer() {
  const { setCurrentPitch, setAllPitches } = usePitchContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [error, setError] = useState(null);

  const clarityVar = useSelector(state=>state.clarity);
  console.log(clarityVar);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const frameIdRef = useRef(null);
  const startTimeRef = useRef(null);

  const recentPitches = []; // for moving average
  const newPitches = [];

  const MAX_RECENT = 5;
  const MAX_JUMP = 100; // Hz

  const smoothPitch = (pitch) => {
    recentPitches.push(pitch);
    if (recentPitches.length > MAX_RECENT) {
      recentPitches.shift();
    }
    const sum = recentPitches.reduce((a, b) => a + b, 0);
    return sum / recentPitches.length;
  };

  const analyzePitch = async () => {
    setError(null);
    setPitches([]);
    setIsAnalyzing(true);
    recentPitches.length = 0;

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

      let lastPitch = null;

      const loop = () => {
        analyser.getFloatTimeDomainData(floatBuffer);
        const [rawPitch, clarity] = detector.findPitch(floatBuffer, audioContext.sampleRate);
        const time = audioContext.currentTime - startTimeRef.current;
        if (clarity * 100 >= clarityVar) {
          const roundedPitch = Math.round(rawPitch);

          if (
            lastPitch === null || 
            Math.abs(roundedPitch - lastPitch) < MAX_JUMP
          ) {
            const smoothed = Math.round(smoothPitch(roundedPitch));
            const pitchData = {
              time,
              pitch: smoothed,
              clarity: clarity.toFixed(2),
            };

            newPitches.push(pitchData);
            setPitches([...newPitches]);
            setCurrentPitch(smoothed);
            setAllPitches([...newPitches]);

            lastPitch = smoothed;
          }
        }

        frameIdRef.current = requestAnimationFrame(loop);
      };

      loop();

      // Stop after 10 seconds (or expose this as an external call)
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
