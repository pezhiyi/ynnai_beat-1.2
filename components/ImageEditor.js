import { useEffect, useRef, useState } from 'react';
import styles from '../styles/modules/components/image-editor.module.css';

const ImageEditor = ({ layer, onTransformChange, onConfirm, onCancel }) => {
  const targetRef = useRef(null);
  const [transform, setTransform] = useState({
    rotate: 0,
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // 更新变换状态
  const updateTransform = () => {
    if (targetRef.current) {
      targetRef.current.style.transform = `translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotate}deg) scale(${transform.scale})`;
    }
  };

  // 当变换状态改变时更新样式
  useEffect(() => {
    updateTransform();
  }, [transform]);

  // 处理旋转变化
  const handleRotateChange = (e) => {
    const newRotate = parseFloat(e.target.value);
    setTransform(prev => ({
      ...prev,
      rotate: newRotate
    }));
    onTransformChange({
      type: 'rotate',
      value: newRotate
    });
  };

  // 处理缩放变化
  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
    onTransformChange({
      type: 'scale',
      value: newScale
    });
  };

  // 处理确认
  const handleConfirm = () => {
    onConfirm({
      rotate: transform.rotate,
      scale: transform.scale,
      translateX: transform.translateX,
      translateY: transform.translateY
    });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <div className={styles.title}>编辑图层</div>
        <button className={styles.closeButton} onClick={onCancel}>×</button>
      </div>

      <div className={styles.imageWrapper}>
        <div 
          className={styles.imageContainer}
          style={{
            aspectRatio: '3/4',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            background: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div 
            ref={targetRef} 
            className={styles.imageTarget}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={layer.src} 
              alt={layer.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>旋转</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={transform.rotate}
              onChange={handleRotateChange}
              className={styles.slider}
            />
            <span>{Math.round(transform.rotate)}°</span>
          </div>

          <div className={styles.controlGroup}>
            <label>缩放</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={transform.scale}
              onChange={handleScaleChange}
              className={styles.slider}
            />
            <span>{(transform.scale * 100).toFixed(0)}%</span>
          </div>

          <div className={styles.controlGroup}>
            <button
              className={styles.resetButton}
              onClick={() => {
                setTransform({
                  rotate: 0,
                  scale: 1,
                  translateX: 0,
                  translateY: 0
                });
                onTransformChange({
                  type: 'reset'
                });
              }}
            >
              重置变换
            </button>
          </div>
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.confirm} onClick={handleConfirm}>
          确认并保存
        </button>
        <button className={styles.cancel} onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
