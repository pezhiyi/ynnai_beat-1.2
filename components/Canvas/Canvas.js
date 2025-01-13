import { useEffect, useRef, useState } from 'react';

export default function Canvas({ imageUrl, tool }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }
      setContext(ctx);

      // 加载图片
      const image = new Image();
      image.crossOrigin = 'anonymous'; // 允许跨域图片
      image.src = imageUrl;
      
      image.onload = () => {
        try {
          // 设置画布大小为图片大小
          canvas.width = image.width;
          canvas.height = image.height;
          // 绘制图片
          ctx.drawImage(image, 0, 0);
        } catch (err) {
          setError('加载图片时出错：' + err.message);
        }
      };

      image.onerror = () => {
        setError('无法加载图片');
      };
    } catch (err) {
      setError('初始化画布时出错：' + err.message);
    }
  }, [imageUrl]);

  const startDrawing = (e) => {
    if (!context || error) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !context || error) return;
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context || error) return;
    context.closePath();
    setIsDrawing(false);
  };

  if (error) {
    return (
      <div className="canvas-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
}
