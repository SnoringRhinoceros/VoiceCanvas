// src/hooks/useMicrophone.js
import { useEffect, useState } from 'react';

export const useMicrophone = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [stream, setStream] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(stream);

      setAudioContext(audioContext);
      setStream(stream);
      setSourceNode(sourceNode);
    };

    init();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      audioContext?.close();
    };
  }, []);

  return { audioContext, stream, sourceNode };
};
