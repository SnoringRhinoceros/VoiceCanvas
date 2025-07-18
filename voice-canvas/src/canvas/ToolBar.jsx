export function Toolbar({ brushColor, setBrushColor, brushSize, setBrushSize }) {
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
          max="12"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
      </div>
    </div>
  );
}