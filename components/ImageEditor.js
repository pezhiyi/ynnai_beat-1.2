import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/modules/components/image-editor.module.css';

const ImageEditor = ({ layer, onTransformChange, onConfirm, onCancel, initialTransform }) => {
  const targetRef = useRef(null);
  const containerRef = useRef(null);
  const [transform, setTransform] = useState(initialTransform || {
    rotate: 0,
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // 当初始变换值改变时更新状态
  useEffect(() => {
    if (initialTransform) {
      setTransform(initialTransform);
    }
  }, [initialTransform]);

  // 更新变换状态
  const updateTransform = () => {
    if (targetRef.current && containerRef.current) {
      const container = containerRef.current;
      const img = targetRef.current;
      const imgElement = img.querySelector('img');

      // 获取容器尺寸
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // 计算中心点
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      // 计算图片实际尺寸
      const imgWidth = imgElement.offsetWidth * transform.scale;
      const imgHeight = imgElement.offsetHeight * transform.scale;

      // 计算图片中心点
      const imgCenterX = centerX + transform.translateX;
      const imgCenterY = centerY + transform.translateY;

      // 应用变换，以图片中心为基准点
      img.style.transform = `
        translate(${imgCenterX}px, ${imgCenterY}px)
        translate(-50%, -50%)
        rotate(${transform.rotate}deg)
        scale(${transform.scale})
      `;
    }
  };

  // 当变换状态改变时更新样式
  useEffect(() => {
    updateTransform();
  }, [transform]);

  // 当容器大小改变时更新变换
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateTransform();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 当图片加载完成时更新变换
  const handleImageLoad = () => {
    updateTransform();
  };

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.editor}
    >
      <div className={styles.header}>
        <div className={styles.title}>编辑图层</div>
        <button className={styles.closeButton} onClick={onCancel}>×</button>
      </div>

      <div className={styles.imageWrapper}>
        <div 
          className={styles.imageContainer}
          style={{
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto',
            background: 'rgba(0, 0, 0, 0.03)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            paddingTop: '133.33%', // 3:4 比例
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            ref={containerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <div 
              ref={targetRef} 
              className={styles.imageTarget}
              style={{
                position: 'absolute',
                transformOrigin: '50% 50%',
                willChange: 'transform'
              }}
            >
              <img 
                src={layer.src} 
                alt={layer.name}
                style={{
                  display: 'block',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
                  transformOrigin: '50% 50%'
                }}
                onLoad={handleImageLoad}
                onClick={(e) => e.stopPropagation()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
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
            <span className={styles.value}>{Math.round(transform.rotate)}°</span>
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
            <span className={styles.value}>{(transform.scale * 100).toFixed(0)}%</span>
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
    </motion.div>
  );
};

export default ImageEditor;
