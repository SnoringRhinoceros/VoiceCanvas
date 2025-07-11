import "./canvas.css";
import { useRef, useEffect } from "react";
import {usePitchContext} from "../context/PitchContext.jsx";

const canvasWidth = 800;
const canvasHeight = 800;

export function Canvas() {
  const canvas = useRef(null);
  const ctx = useRef(null);
  const lastPos = useRef(null);
  const lastPitchObj = useRef(null);
  const pitchObjArray = usePitchContext().allPitches;
  console.log(pitchObjArray);
  const pitchObj = pitchObjArray[pitchObjArray.length -1];
  console.log(pitchObj);

  useEffect(() => {
    if (canvas.current) {
      ctx.current = canvas.current.getContext("2d");
      ctx.current.fillStyle = "rgb(0, 0, 255)";
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight); // only once
    }
  }, []); // Only runs once on mount


  useEffect(() => {
    if (canvas.current) {
      calculateLine(lastPitchObj.current, pitchObj, ctx.current);
      lastPitchObj.current = pitchObj;
    }
  }, [pitchObj]);

  return (
    <canvas
      ref={canvas}
      id="canvas"
      height={canvasHeight}
      width={canvasWidth}
    />
  );
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function calculateLine(lastPitchObj, currentPitchObj, ctx){
  const {time: lastPitchTime, pitch: lastPitchFrequency} = lastPitchObj ?? {time: 0, pitch: 0};
  const {time: currentPitchTime, pitch: currentPitchFrequency} = currentPitchObj ?? {time: 0, pitch: 0};
  const loopTime = 10;
  if((lastPitchTime % loopTime) > (currentPitchTime % loopTime)){
    drawHueShiftLine(ctx, 0, canvasHeight - lastPitchFrequency, (currentPitchTime % 10)/10 * canvasWidth, canvasHeight - currentPitchFrequency);
    return;
  }
  drawHueShiftLine(ctx, (lastPitchTime % 10)/10 * canvasWidth, canvasHeight - lastPitchFrequency, (currentPitchTime % 10)/10 * canvasWidth, canvasHeight - currentPitchFrequency);
}

function drawHueShiftLine2(ctx, x0, y0, x1, y1) {
  const minX = x0; // start of allowed x-range
  const maxX = x1; // end of allowed x-range

  ctx.save();

  // Clip drawing to only occur between minX and maxX
  ctx.beginPath();
  ctx.rect(minX, 0, maxX + 1 - minX, canvasHeight);
  ctx.clip();

  ctx.globalCompositeOperation = "color";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(255, 0, 0, 1)";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  ctx.restore();
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

  // Clamp to canvas bounds
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

        if (px < x0 || px >= x1) continue;

        const relX = px - safeMinX;
        const relY = py - safeMinY;

        if (
          relX < 0 || relX >= safeWidth ||
          relY < 0 || relY >= safeHeight
        ) continue;

        const index = (relY * safeWidth + relX) * 4;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Always shift hue regardless of current color
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


function drawHueShiftLine3(ctx, x0, y0, x1, y1) {
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

    // Draw a circle at each step for line thickness
    for (let oy = -lineThickness; oy <= lineThickness; oy++) {
      for (let ox = -lineThickness; ox <= lineThickness; ox++) {
        const px = x + ox;
        const py = y + oy;

        
        if (px < 0 || py < 0 || px >= canvasWidth || py >= canvasHeight) continue;

        if(px < x0 || px >= x1){continue;}

        const index = (py * canvasWidth + px) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // If already painted (not pure blue), shift hue
        let [h, s, l] = rgbToHsl(r, g, b);
        h = (h + hueShift) % 360;
        const [nr, ng, nb] = hslToRgb(h, s, l);

        data[index]     = nr;
        data[index + 1] = ng;
        data[index + 2] = nb;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ----- Color helpers -----
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
    r = g = b = l; // gray
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
