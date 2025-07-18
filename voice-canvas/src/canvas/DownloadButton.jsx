export default function DownloadButton({ canvasRef }) {
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <button onClick={handleDownload}>
      Download Drawing
    </button>
  );
}