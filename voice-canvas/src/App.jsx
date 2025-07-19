import { Canvas } from "./canvas/Canvas.jsx";
import {Settings} from "./settings/settings.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';
import VoiceController from "./speech/VoiceController.jsx";
import DownloadButton from "./canvas/DownloadButton.jsx";
import { useRef, createContext } from "react";
import MicModeToggle from './speech/MicModeToggle.jsx';
import { useMicMode } from './context/MicModeContext';
import { CommandLog } from "./speech/CommandLog.jsx";

export const TimeContext = createContext();

function App() {
    const canvasRef = useRef(null);
    const { micMode, setMicMode } = useMicMode();


  return (
    <TimeContext.Provider value={10}>
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",     // horizontal centering
      justifyContent: "center", // vertical centering
      minHeight: "100vh",        // full height for vertical centering
      gap: "1rem",               // space between elements
      background: "#111"         // optional dark bg for better contrast
    }}>
      <div style={{
        position: 'relative',
        width: '90vw',           // or "400px", or "min(90vw, 600px)"
        height: '90vw',          // makes it a square
        maxWidth: '600px',
        maxHeight: '600px',      // optional cap
        aspectRatio: '1',        // enforce square even on resize (optional)
      }}>
        <Canvas canvasRef={canvasRef} />
      </div>


      <MicModeToggle micMode={micMode} setMicMode={setMicMode} />
      <DownloadButton canvasRef={canvasRef} />
      <Settings />
      <PitchAnalyzerComponent />
      <VoiceController />
      <CommandLog />
    </div>
    </TimeContext.Provider>
  );
}


export default App;
