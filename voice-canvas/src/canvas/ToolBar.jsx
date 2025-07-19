import { useEffect } from 'react';
import { useCommandBus } from '../context/CommandContext';
import { VoiceCommands } from '../speech/commands/commandMap';

export function Toolbar({ brushColor, setBrushColor, brushSize, setBrushSize }) {
  const { subscribe } = useCommandBus();

  useEffect(() => {
    const commandActions = {
      [VoiceCommands.color_red]: () => setBrushColor('red'),
      [VoiceCommands.color_green]: () => setBrushColor('green'),
      [VoiceCommands.color_blue]: () => setBrushColor('blue'),
      [VoiceCommands.color_white]: () => setBrushColor('white'),
      [VoiceCommands.color_rainbow]: () => setBrushColor('rainbow'),
      [VoiceCommands.increase_brush]: () =>
        setBrushSize?.((prev) => Math.min((prev || brushSize) + 5, 40)),
      [VoiceCommands.decrease_brush]: () =>
        setBrushSize?.((prev) => Math.max((prev || brushSize) - 5, 1)),
      [VoiceCommands.set_brush_size]: (size) => {
        if (size >= 1 && size <= 40) {
          setBrushSize(size);
        } else {
          console.warn('Invalid brush size:', size);
        }
      }
    };

    const unsub = subscribe((msg) => {
      const { command, value } = typeof msg === 'string' ? { command: msg } : msg;

      const action = commandActions[command];
      if (action) {
        action(value);
      } else {
        console.warn('⚠️ No action mapped for command:', msg);
      }
    });

    return unsub;
  }, [setBrushColor, setBrushSize, brushSize]);

  // UI rendering
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px",
      background: "#2c2f33",
      borderBottom: "2px solid #444",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {["red", "green", "blue", "white", "rainbow"].map(color => (
          <button
            key={color}
            onClick={() => setBrushColor(color)}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background:
                color === "rainbow"
                  ? "linear-gradient(to right, red, orange, yellow, green, blue, violet)"
                  : color,
              border: brushColor === color ? "2px solid black" : "2px solid transparent",
              cursor: "pointer"
            }}
            title={color}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label htmlFor="brushSize">Brush Size</label>
        <input
          id="brushSize"
          type="range"
          min="1"
          max="40"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
