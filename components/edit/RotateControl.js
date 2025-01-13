import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const RotateControl = ({ angle = 0, onChange, onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const controlRef = useRef(null);

  const calculateAngle = (e) => {
    if (!controlRef.current) return 0;
    
    const rect = controlRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // 计算角度（弧度）
    let angle = Math.atan2(y, x);
    // 转换为度数
    angle = angle * (180 / Math.PI);
    // 调整角度范围为 0-360
    angle = (angle + 360) % 360;
    
    return angle;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartAngle(calculateAngle(e));
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const currentAngle = calculateAngle(e);
    const deltaAngle = currentAngle - startAngle;
    
    onChange?.(deltaAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onComplete?.();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      ref={controlRef}
      className="rotate-control"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      style={{ transform: `rotate(${angle}deg)` }}
      onMouseDown={handleMouseDown}
    >
      <div className="control-handle" />
      <div className="control-circle" />
    </motion.div>
  );
};

export default RotateControl; 