import "./canvas.css";
import { useRef, useEffect } from "react";
import { usePitchContext } from "../context/PitchContext.jsx";
import { useSelector } from "react-redux";

const canvasWidth = 800;
const canvasHeight = 800;

export function Canvas() {
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

  const thresholdVar = useSelector(state => state.threshold);
  const pitchObjArray = usePitchContext().allPitches;
  const pitchObj = pitchObjArray[pitchObjArray.length - 1];

  // Initialize base canvas background once
  useEffect(() => {
    if (canvas.current) {
      ctx.current = canvas.current.getContext("2d");
      ctx.current.fillStyle = "rgb(0, 0, 255)";
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }, []);

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

    calculateLine(prevPitchForDraw.current, pitchObj, ctx.current, thresholdVar);

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
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);


  return (<>
    <div style={{ position: "relative", width: "90vw", height: canvasHeight }}>
      <canvas
        ref={canvas}
        id="canvas"
        height={canvasHeight}
        width={canvasWidth}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
      />
      <canvas
        id="overlayCanvas"
        ref={overlayCanvas}
        height={canvasHeight}
        width={canvasWidth}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }}
      />
      
    </div>
    <button
        onClick={() => {
          downloadCanvas(canvas.current);
        }}
        style={{ position: "relative"}}
      >
        Download
      </button>
  </>);
}

// --- Utility Functions ---

function downloadCanvas(canvas) {
  const link = document.createElement("a");
  link.download = "filename.png";
  link.href = canvas.toDataURL();
  link.click();
}

function calculateLine(lastPitchObj, currentPitchObj, ctx, threshold) {
  const { time: lastPitchTime, pitch: lastPitchFrequency } = lastPitchObj ?? { time: 0, pitch: 0 };
  const { time: currentPitchTime, pitch: currentPitchFrequency } = currentPitchObj ?? { time: 0, pitch: 0 };
  if (lastPitchFrequency < threshold || currentPitchFrequency < threshold) return;

  const loopTime = 10;
  if ((lastPitchTime % loopTime) > (currentPitchTime % loopTime)) {
    drawHueShiftLine(ctx, 0, canvasHeight - lastPitchFrequency, (currentPitchTime % 10) / 10 * canvasWidth, canvasHeight - currentPitchFrequency);
    return;
  }
  drawHueShiftLine1(ctx, (lastPitchTime % 10) / 10 * canvasWidth, canvasHeight - lastPitchFrequency, (currentPitchTime % 10) / 10 * canvasWidth, canvasHeight - currentPitchFrequency);
}

function drawHueShiftLine(ctx, x0, y0, x1, y1) {
  const thickness = 10;

  const minX = Math.floor(Math.min(x0, x1)) - thickness;
  const maxX = Math.ceil(Math.max(x0, x1)) + thickness;
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
  const hueShift = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + dx * t);
    const y = Math.round(y0 + dy * t);

    for (let oy = -thickness; oy <= thickness; oy++) {
      for (let ox = -thickness; ox <= thickness; ox++) {
        const px = x + ox;
        const py = y + oy;

        if ((px <= x0) || px >= x1) continue;

        const relX = px - safeMinX;
        const relY = py - safeMinY;

        if (relX < 0 || relX >= safeWidth || relY < 0 || relY >= safeHeight) continue;

        const index = (relY * safeWidth + relX) * 4;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        let [h, s, l] = rgbToHsl(r, g, b);
        h = (h + hueShift) % 360;
        const [nr, ng, nb] = hslToRgb(h, s, l);
        data[index] = nr;
        data[index + 1] = ng;
        data[index + 2] = nb;
      }
    }
  }

  ctx.putImageData(imageData, safeMinX, safeMinY);
}

function drawHueShiftLine1(ctx, x0, y0, x1, y1) {
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;
  const hueShift = 20;
  const lineThickness = 3;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const distance = Math.max(Math.abs(dx), Math.abs(dy));

  for (let i = 0; i <= distance; i++) {
    const t = i / distance;
    const x = Math.round(x0 + dx * t);
    const y = Math.round(y0 + dy * t);

    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);

    for (let oy = -lineThickness; oy <= lineThickness; oy++) {
      for (let ox = -lineThickness; ox <= lineThickness; ox++) {
        const px = x + ox;
        const py = y + oy;

        if (px < 0 || py < 0 || px >= canvasWidth || py >= canvasHeight) continue;
        if (px < minX || px >= maxX) continue;

        const index = (py * canvasWidth + px) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        let [h, s, l] = rgbToHsl(r, g, b);
        h = (h + hueShift) % 360;
        const [nr, ng, nb] = hslToRgb(h, s, l);

        data[index] = nr;
        data[index + 1] = ng;
        data[index + 2] = nb;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
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
