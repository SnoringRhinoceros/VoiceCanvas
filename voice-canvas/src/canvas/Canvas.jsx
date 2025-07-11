import "./canvas.css";
import { useRef, useEffect } from "react";

const canvasWidth = 800;
const canvasHeight = 800;

export function Canvas() {
  const canvas = useRef(null);
  const ctx = useRef(null);
  const lastPos = useRef(null);

  useEffect(() => {
    if (canvas.current) {
      ctx.current = canvas.current.getContext("2d");
      ctx.current.fillStyle = "rgb(0, 0, 255)"; // Start with blue
      ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    return () => {
      if (!ctx.current) return;
      clearCanvas(ctx.current);
    };
  }, []);

  const handleMouseMove = ({ clientX, clientY }) => {
    const rect = canvas.current.getBoundingClientRect();
    const x = ((clientX - rect.x) / rect.width) * canvasWidth;
    const y = ((clientY - rect.y) / rect.height) * canvasHeight;

    if (lastPos.current) {
      drawHueShiftLine(ctx.current, lastPos.current.x, lastPos.current.y, x, y);
    }

    lastPos.current = { x, y };
  };

  const handleMouseLeave = () => {
    lastPos.current = null;
  };

  return (
    <canvas
      ref={canvas}
      id="canvas"
      height={canvasHeight}
      width={canvasWidth}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawHueShiftLine(ctx, x0, y0, x1, y1) {
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
