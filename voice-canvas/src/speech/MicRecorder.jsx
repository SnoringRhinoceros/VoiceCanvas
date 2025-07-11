import useMicRecorder from './hooks/useMicRecorder';

export default function MicRecorder() {
  const { recording, startRecording, stopRecording } = useMicRecorder();

  return (
    <div>
      <h2>Mic Recorder</h2>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
