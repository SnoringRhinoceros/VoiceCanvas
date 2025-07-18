import { Canvas } from "./canvas/Canvas.jsx";
import {Settings} from "./settings/settings.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';
import VoiceController from "./speech/VoiceController.jsx";

function App() {
  return (
    <>
      {/* <MicRecorder /> */}
      <Canvas />
      <Settings/>
      <PitchAnalyzerComponent />
      <VoiceController></VoiceController>
    </>
  )
}

export default App;
