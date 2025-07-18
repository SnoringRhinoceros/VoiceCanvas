// src/speech/VoiceController.jsx
import { useEffect } from 'react';
import { useWhisperTranscriber } from './hooks/useWhisperTranscriber';
import { useMicMode } from '../context/MicModeContext';

export default function VoiceController() {
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperTranscriber();
  const { micMode } = useMicMode();

  useEffect(() => {
    if (micMode === 'command' && !isRecording) {
      startRecording();
    } else if (micMode !== 'command' && isRecording) {
      stopRecording();
    }
  }, [micMode]);

  return (
    <div className="p-4">
      <p className="text-sm italic text-gray-500">
        {isRecording ? 'Listening for commands...' : 'Not listening'}
      </p>
      {transcript && (
        <p className="mt-2 font-mono text-yellow-800">
          Transcript: {transcript}
        </p>
      )}
    </div>
  );
}
