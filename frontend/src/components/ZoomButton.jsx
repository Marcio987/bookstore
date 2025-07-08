import { useState } from "react";

function ZoomButton() {
  const [zoomed, setZoomed] = useState(false);

  const toggleZoom = () => {
    if (zoomed) {
      document.body.style.transform = "scale(1)";
      document.body.style.transformOrigin = "top left";
      document.body.style.transition = "transform 0.3s ease";
      setZoomed(false);
    } else {
      document.body.style.transform = "scale(2)";
      document.body.style.transformOrigin = "top left";
      document.body.style.transition = "transform 0.3s ease";
      setZoomed(true);
    }
  };

  return (
    <button
      onClick={toggleZoom}
      className="fixed top-4 right-4 bg-yellow-300 text-black p-2 rounded shadow font-bold"
    >
      {zoomed ? "Zmniejsz" : "Powiększ"}
    </button>
  );
}

export default ZoomButton;
