import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RotateControl from './RotateControl';

const EditToolbar = ({ 
  selectedLayer,
  onRotate,
  onRotateComplete,
  currentAngle = 0
}) => {
  const [showRotate, setShowRotate] = useState(false);

  const handleRotateClick = () => {
    if (!selectedLayer) {
      alert('请先选择要编辑的图层');
      return;
    }
    setShowRotate(prev => !prev);
  };

  const handleRotateChange = (angle) => {
    onRotate?.(angle);
  };

  const handleRotateComplete = (angle) => {
    onRotateComplete?.(angle);
    setShowRotate(false);
  };

  return (
    <div className="toolbar">
      <button
        className={`tool-button ${showRotate ? 'active' : ''}`}
        onClick={handleRotateClick}
        title="旋转"
      >
        <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {showRotate && (
          <RotateControl
            angle={currentAngle}
            onChange={handleRotateChange}
            onComplete={handleRotateComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditToolbar; 