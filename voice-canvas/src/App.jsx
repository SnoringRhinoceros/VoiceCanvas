import { Canvas } from "./canvas/Canvas.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';

function App() {
  return (
    <>
      {/* <MicRecorder /> */}
      <Canvas />
      <PitchAnalyzerComponent />
    </>
  )
}

export default App;
