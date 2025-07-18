import { Canvas } from "./canvas/Canvas.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';
import VoiceController from "./speech/VoiceController.jsx";

function App() {
  return (
    <>
      {/* <MicRecorder /> */}
      <Canvas />
      <PitchAnalyzerComponent />
      <VoiceController></VoiceController>
    </>
  )
}

export default App;
