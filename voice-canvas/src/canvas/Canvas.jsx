import "./canvas.css";
import {Toolbar} from "./Toolbar.jsx"; 
import { useRef, useEffect, useState } from "react";
import { usePitchContext } from "../context/PitchContext.jsx";
import { useSelector } from "react-redux";

const canvasWidth = 800;
const canvasHeight = 800;


export function Canvas({ canvasRef }) {
  const canvas = useRef(null);         // Base canvas ref
  const overlayCanvas = useRef(null);  // Overlay canvas ref
  const ctx = useRef(null);            // Base canvas context

  // For stream detection
  const lastPitchObj = useRef(null);
  // For drawing lines (previous pitch)
  const prevPitchForDraw = useRef(null);

  const frameRef = useRef(null);
  const startTime = useRef(null);
  const drawingStarted = useRef(false);

  const [brushColor, setBrushColor] = useState("rainbow");
  const [brushSize, setBrushSize] = useState(4);

  const thresholdVar = useSelector(state => state.threshold);
  const pitchObjArray = usePitchContext().allPitches;
  const pitchObj = pitchObjArray[pitchObjArray.length - 1];
  console.log(pitchObj);

  // Detect new stream by comparing current pitch time with lastPitchObj time
  useEffect(() => {
    if (!pitchObj) return;

    if (lastPitchObj.current && pitchObj.time < lastPitchObj.current.time) {
      // New stream detected - reset animation and clear overlay
      drawingStarted.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (overlayCanvas.current) {
        const overlayCtx = overlayCanvas.current.getContext("2d");
        overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
      // Reset previous pitch used for drawing to avoid gaps
      prevPitchForDraw.current = null;
    }

    // Update lastPitchObj here AFTER new stream check
    lastPitchObj.current = pitchObj;
  }, [pitchObj]);

  // Draw pitch line and start overlay animation once per stream
  useEffect(() => {
    if (!canvas.current || !pitchObj) return;

    calculateLine(prevPitchForDraw.current, pitchObj, ctx.current, thresholdVar, brushColor, brushSize);

    prevPitchForDraw.current = pitchObj; // update previous pitch *after* drawing

    if (!drawingStarted.current) {
      drawingStarted.current = true;
      startOverlayAnimation();
    }
  }, [pitchObj, thresholdVar]);

  // Overlay animation for the red vertical timeline
  function startOverlayAnimation() {
    const overlayCtx = overlayCanvas.current.getContext("2d");
    startTime.current = performance.now();

    function draw(now) {
      const elapsed = now - startTime.current;

      if (elapsed >= 10000) {
        overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        overlayCtx.beginPath();
        overlayCtx.strokeStyle = "red";
        overlayCtx.lineWidth = 2;
        overlayCtx.moveTo(canvasWidth, 0);
        overlayCtx.lineTo(canvasWidth, canvasHeight);
        overlayCtx.stroke();

        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        return;
      }

      const x = (elapsed / 10000) * canvasWidth;

      overlayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      overlayCtx.beginPath();
      overlayCtx.strokeStyle = "red";
      overlayCtx.lineWidth = 2;
      overlayCtx.moveTo(x, 0);
      overlayCtx.lineTo(x, canvasHeight);
      overlayCtx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
  }

  // Cleanup animation frame on unmount
  useEffect(() => {
    console.log("ee");
    if (canvas.current) {
      console.log("ran");
      ctx.current = canvas.current.getContext("2d", { willReadFrequently: true });
      ctx.current.fillStyle = "rgb(0, 0, 255)";
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Toolbar
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
      />
      <div id="canvases">
        <canvas
          ref={canvas}
          id="canvas"
          width={canvasWidth}
          height={canvasHeight}
        />
        <canvas
          ref={overlayCanvas}
          id="overlayCanvas"
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
    </>
  );
}



function calculateLine(lastPitchObj, currentPitchObj, ctx, threshold, color, brushSize) {
  const { time: t1, pitch: p1 } = lastPitchObj ?? { time: 0, pitch: 0 };
  const { time: t2, pitch: p2 } = currentPitchObj ?? { time: 0, pitch: 0 };
  if (p1 < threshold || p2 < threshold) return;

  console.log(brushSize);

  const loopTime = 10;
  const x1 = (t1 % loopTime) / loopTime * canvasWidth;
  let y1 = canvasHeight - p1;
  const x2 = (t2 % loopTime) / loopTime * canvasWidth;
  const y2 = canvasHeight - p2;
  if(color === "rainbow"){
    if ((t1 % loopTime) > (t2 % loopTime)) {
      drawHueShiftLine(ctx, 0, canvasHeight - p1, x2, y2, brushSize);
    } else {
      drawHueShiftLine(ctx, x1, y1, x2, y2, brushSize);
    }
  }else{
    if((t1 % loopTime) > (t2 % loopTime)){
      drawNormalLine(ctx, 0, canvasHeight - p1, x2, y2, color, brushSize);
    }else{
      drawNormalLine(ctx, x1, y1, x2, y2, color, brushSize);
    }
  }
}

function drawNormalLine(ctx, x0, y0, x1, y1, color, size) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round"; // smooth edges
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}


function drawHueShiftLine(ctx, x0, y0, x1, y1, size) {
    const thickness = size;

    const minX = Math.floor(Math.min(x0, x1)) - 3;
    const maxX = Math.ceil(Math.max(x0, x1)) + 3;
    const minY = Math.floor(Math.min(y0, y1)) - thickness;
    const maxY = Math.ceil(Math.max(y0, y1)) + thickness;

    const width = maxX - minX;
    const height = maxY - minY;

    if (width <= 0 || height <= 0) return;

    const safeMinX = Math.max(0, minX);
    const safeMinY = Math.max(0, minY);
    const safeWidth = Math.min(canvasWidth - safeMinX, width);
    const safeHeight = Math.min(canvasHeight - safeMinY, height);

    const imageData = ctx.getImageData(safeMinX, safeMinY, safeWidth, safeHeight);
    const data = imageData.data;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    

    const slope = (x1-x0)/(y1-y0);

    for(let i = 0; i < data.length; i+=4){
      let x = i/4 % imageData.width;
      let y = Math.floor(i/4 / imageData.width);
      if (!(((dy - size) - slope * (y)) >= -x || ((dy + size) - slope * (y - imageData.height)) <= -x)){continue;}
      shiftPixelData(data, i);
    }
    ctx.putImageData(imageData, safeMinX, safeMinY);
}


function shiftPixelData(data, i){
  const hueShift = 40;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  let [h, s, l] = rgbToHsl(r, g, b);
  h = (h + hueShift) % 360;
  const [nr, ng, nb] = hslToRgb(h, s, l);
  data[i] = nr;
  data[i + 1] = ng;
  data[i + 2] = nb;
}

// --- Color Helpers ---

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255].map(Math.round);
}
