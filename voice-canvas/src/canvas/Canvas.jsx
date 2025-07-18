import "./canvas.css";
import { useRef, useEffect } from "react";
import { usePitchContext } from "../context/PitchContext.jsx";
import { useSelector } from "react-redux";

export function Canvas({ canvasRef }) {
  const overlayCanvas = useRef(null);
  const ctx = useRef(null);

  const lastPitchObj = useRef(null);
  const prevPitchForDraw = useRef(null);
  const frameRef = useRef(null);
  const startTime = useRef(null);
  const drawingStarted = useRef(false);

  const thresholdVar = useSelector(state => state.threshold);
  const pitchObjArray = usePitchContext().allPitches;
  const pitchObj = pitchObjArray[pitchObjArray.length - 1];

  const isCanvasReady = useRef(false);


  useEffect(() => {
    const canvasEl = canvasRef?.current;
    if (!canvasEl) return;

    const displayWidth = canvasEl.clientWidth;
    const displayHeight = canvasEl.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvasEl.width = displayWidth * dpr;
    canvasEl.height = displayHeight * dpr;

    const context = canvasEl.getContext("2d");
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
    context.scale(dpr, dpr);

    ctx.current = context;
    context.fillStyle = "rgb(0, 0, 255)";
    context.fillRect(0, 0, displayWidth, displayHeight);
  }, [canvasRef]);

  useEffect(() => {
    if (!pitchObj) return;

    const overlayCtx = overlayCanvas.current?.getContext("2d");
    const canvasEl = canvasRef?.current;

    if (!canvasEl || !overlayCtx) return;

    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;

    if (lastPitchObj.current && pitchObj.time < lastPitchObj.current.time) {
      drawingStarted.current = false;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      overlayCtx.clearRect(0, 0, width, height);
      prevPitchForDraw.current = null;
    }

    lastPitchObj.current = pitchObj;
  }, [pitchObj, canvasRef]);

  useEffect(() => {
    if (!canvasRef?.current || !pitchObj || !ctx.current) return;

    const canvasEl = canvasRef.current;
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;

    calculateLine(prevPitchForDraw.current, pitchObj, ctx.current, thresholdVar, width, height);
    prevPitchForDraw.current = pitchObj;

    if (!drawingStarted.current) {
      drawingStarted.current = true;
      startOverlayAnimation(width, height);
    }
  }, [pitchObj, thresholdVar, canvasRef]);

  function startOverlayAnimation(width, height) {
    const overlayCtx = overlayCanvas.current.getContext("2d");
    startTime.current = performance.now();

    function draw(now) {
      const elapsed = now - startTime.current;

      if (elapsed >= 10000) {
        overlayCtx.clearRect(0, 0, width, height);
        overlayCtx.beginPath();
        overlayCtx.strokeStyle = "red";
        overlayCtx.lineWidth = 2;
        overlayCtx.moveTo(width, 0);
        overlayCtx.lineTo(width, height);
        overlayCtx.stroke();
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        return;
      }

      const x = (elapsed / 10000) * width;
      overlayCtx.clearRect(0, 0, width, height);
      overlayCtx.beginPath();
      overlayCtx.strokeStyle = "red";
      overlayCtx.lineWidth = 2;
      overlayCtx.moveTo(x, 0);
      overlayCtx.lineTo(x, height);
      overlayCtx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
  }

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={overlayCanvas}
        id="overlayCanvas"
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2
        }}
      />
    </>
  );
}



function calculateLine(lastPitchObj, currentPitchObj, ctx, threshold, width, height) {
  const { time: t1, pitch: p1 } = lastPitchObj ?? { time: 0, pitch: 0 };
  const { time: t2, pitch: p2 } = currentPitchObj ?? { time: 0, pitch: 0 };
  if (p1 < threshold || p2 < threshold) return;

  const loopTime = 10;
  const x1 = (t1 % loopTime) / loopTime * width;
  const y1 = height - p1;
  const x2 = (t2 % loopTime) / loopTime * width;
  const y2 = height - p2;

  if ((t1 % loopTime) > (t2 % loopTime)) {
    drawHueShiftLine(ctx, 0, height - p1, x2, y2, width, height);
  } else {
    drawHueShiftLine1(ctx, x1, y1, x2, y2, width, height);
  }
}


function drawHueShiftLine(ctx, x0, y0, x1, y1, canvasWidth, canvasHeight) {
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

function drawHueShiftLine1(ctx, x0, y0, x1, y1, canvasWidth, canvasHeight) {
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
