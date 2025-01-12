import { useEffect, useRef } from 'react';
import { useCanvas } from '@/hooks/useCanvas';

export default function Canvas({ imageUrl, tool }) {
  const canvasRef = useRef(null);
  const { 
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    initCanvas
  } = useCanvas();

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas(canvasRef.current);
      
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
      }
    }
  }, [imageUrl]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-canvas"
      />
    </div>
  );
}
