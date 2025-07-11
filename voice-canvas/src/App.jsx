import { Canvas } from "./canvas/Canvas.jsx";
import {Settings} from "./settings/settings.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';

function App() {
  return (
    <>
      {/* <MicRecorder /> */}
      <Canvas />
      <Settings/>
      <PitchAnalyzerComponent />
    </>
  )
}

export default App;
