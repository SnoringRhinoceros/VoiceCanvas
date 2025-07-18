// hooks/useWhisperTranscriber.js
import { useState, useRef } from 'react';
import { useCommandBus } from '../../context/CommandContext.jsx';
import { matchCommand } from '../commands/matchCommand.js';

export function useWhisperTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { sendCommand } = useCommandBus();

  const parseCommand = (text) => {
    const command = matchCommand(text);
    if (command) sendCommand(command);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('audio', new File([blob], 'speech.webm', { type: 'audio/webm' }));

      try {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        const text = data.text || '';

        setTranscript(text);
        parseCommand(text);
      } catch (err) {
        setError(err.message);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, startRecording, stopRecording, transcript, error };
}
