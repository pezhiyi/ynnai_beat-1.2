import { useState, useCallback } from 'react';

export function useCanvas() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const initCanvas = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');
    // 设置画布大小为设备像素比
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // 处理双指缩放/旋转
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      // 实现缩放和旋转逻辑
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    initCanvas,
    scale,
    rotation
  };
}
