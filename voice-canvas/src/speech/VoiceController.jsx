import { useWhisperTranscriber } from './hooks/useWhisperTranscriber';

export default function VoiceController() {
  const { isRecording, startRecording, stopRecording, transcript } = useWhisperTranscriber();

  return (
    <div className="p-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isRecording ? '🛑 Stop' : '🎤 Start'}
      </button>

      <p className="mt-4">Transcript: {transcript}</p>
    </div>
  );
}
