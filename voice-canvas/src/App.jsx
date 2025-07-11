import { useState } from 'react'
import './App.css'
import {Canvas} from "./canvas/Canvas.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PitchProvider } from './context/PitchContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PitchProvider>
      <App />
    </PitchProvider>
  </React.StrictMode>
);

function App() {

  return (
    <>
      <Canvas />
      <MicRecorder />
      <PitchAnalyzerComponent />
    </>
  )
}

export default App
