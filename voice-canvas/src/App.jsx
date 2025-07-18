import { Canvas } from "./canvas/Canvas.jsx";
import MicRecorder from './speech/MicRecorder.jsx';
import PitchAnalyzerComponent from './speech/PitchAnalyzerComponent';
import './App.css';
import VoiceController from "./speech/VoiceController.jsx";
import DownloadButton from "./canvas/DownloadButton.jsx";
import { useRef } from "react";
import MicModeToggle from './speech/MicModeToggle.jsx';
import { useMicMode } from './context/MicModeContext';



function App() {
    const canvasRef = useRef(null);
    const { micMode, setMicMode } = useMicMode();

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            background: "#111"
        }}>
            <div style={{
                position: 'relative',
                width: '90vw',
                height: '90vw',
                maxWidth: '600px',
                maxHeight: '600px',
                aspectRatio: '1',
            }}>
                <Canvas canvasRef={canvasRef} />
            </div>

            <MicModeToggle micMode={micMode} setMicMode={setMicMode} />
            <DownloadButton canvasRef={canvasRef} />
            <Settings />
            <PitchAnalyzerComponent />
            <VoiceController />
        </div> // ✅ properly closing the opening <div>
    );
}


export default App;
