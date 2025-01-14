import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const EditModal = ({ 
  isOpen, 
  onClose, 
  layers,
  selectedLayer,
  dimensions,
  canvasRef,
  onImageUpdate,
  editMode,
  children 
}) => {
  const modalCanvasRef = useRef(null);
  const [editHistory, setEditHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [canvasPosition, setCanvasPosition] = useState({ top: 0, left: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [scaleValue, setScaleValue] = useState(100);
  const [rotateValue, setRotateValue] = useState(0);
  const [previewStyle, setPreviewStyle] = useState({});
  const [initialCanvas, setInitialCanvas] = useState(null);

  // 获取画布位置
  useEffect(() => {
    if (!canvasRef?.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    setCanvasPosition({
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    });
  }, [canvasRef, isOpen]);

  // 初始化画布
  useEffect(() => {
    if (!isOpen || !layers?.length || !modalCanvasRef.current) return;

    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 保持画布大小与初始图像大小一致
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const img = new Image();
    img.onload = () => {
      const imageRatio = img.width / img.height;
      const canvasRatio = (canvas.width / dpr) / (canvas.height / dpr);
      let targetWidth, targetHeight, x, y;

      if (imageRatio > canvasRatio) {
        targetWidth = canvas.width / dpr;
        targetHeight = targetWidth / imageRatio;
        x = 0;
        y = ((canvas.height / dpr) - targetHeight) / 2;
      } else {
        targetHeight = canvas.height / dpr;
        targetWidth = targetHeight * imageRatio;
        x = ((canvas.width / dpr) - targetWidth) / 2;
        y = 0;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, targetWidth, targetHeight);

      // 保存初始状态到临时画布
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
      setInitialCanvas(tempCanvas);

      const initialState = canvas.toDataURL();
      setEditHistory([initialState]);
      setCurrentStep(0);
    };

    const targetImage = layers.length === 1 
      ? layers[0] 
      : layers.find(layer => layer.id === selectedLayer);
    
    if (targetImage) {
      img.src = targetImage.src;
    }
  }, [isOpen, layers, dimensions, selectedLayer]);

  // 保存编辑状态
  const saveEditState = () => {
    if (!modalCanvasRef.current) return;
    const newState = modalCanvasRef.current.toDataURL();
    setEditHistory(prev => [...prev.slice(0, currentStep + 1), newState]);
    setCurrentStep(prev => prev + 1);
    setHasEdits(true);
  };

  // 撤销
  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      loadState(editHistory[currentStep - 1]);
    }
  };

  // 重做
  const redo = () => {
    if (currentStep < editHistory.length - 1) {
      setCurrentStep(prev => prev + 1);
      loadState(editHistory[currentStep + 1]);
    }
  };

  // 加载状态
  const loadState = (dataUrl) => {
    if (!modalCanvasRef.current) return;
    const ctx = modalCanvasRef.current.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, modalCanvasRef.current.width, modalCanvasRef.current.height);
      ctx.drawImage(img, 0, 0, modalCanvasRef.current.width, modalCanvasRef.current.height);
    };
    img.src = dataUrl;
  };

  // 应用编辑结果到主画布
  const applyChanges = () => {
    if (!modalCanvasRef.current) return;
    
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 创建临时画布以保持原始尺寸
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = dimensions.width * dpr;
    tempCanvas.height = dimensions.height * dpr;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 计算缩放比例以适应原始尺寸
    const scaleX = dimensions.width * dpr / canvas.width;
    const scaleY = dimensions.height * dpr / canvas.height;
    const scale = Math.min(scaleX, scaleY);
    
    // 计算居中位置
    const x = (tempCanvas.width - canvas.width * scale) / 2;
    const y = (tempCanvas.height - canvas.height * scale) / 2;
    
    // 将编辑后的图片绘制到临时画布上，并保持比例
    tempCtx.drawImage(
      canvas,
      x, y,
      canvas.width * scale,
      canvas.height * scale
    );
    
    // 获取编辑后的图片数据
    const editedImageData = tempCanvas.toDataURL();
    
    // 更新主画布
    onImageUpdate(editedImageData);
    onClose();
  };

  // 处理缩放
  const handleZoom = (scale) => {
    if (!modalCanvasRef.current || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 计算缩放后的尺寸
    const scaledWidth = initialCanvas.width * scale;
    const scaledHeight = initialCanvas.height * scale;

    // 保持画布大小不变
    canvas.width = initialCanvas.width;
    canvas.height = initialCanvas.height;
    canvas.style.width = `${initialCanvas.width / dpr}px`;
    canvas.style.height = `${initialCanvas.height / dpr}px`;
    
    // 清空原画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 在原画布上进行缩放绘制
    ctx.save();
    ctx.translate((canvas.width - scaledWidth) / 2, (canvas.height - scaledHeight) / 2); // 居中
    ctx.scale(scale, scale);
    ctx.drawImage(initialCanvas, 0, 0);
    ctx.restore();

    setIsEditing(false);
    saveEditState();
  };

  // 处理增强
  const handleEnhance = (factor = 1.2) => {
    if (!modalCanvasRef.current || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);     // R
      data[i + 1] = Math.min(255, data[i + 1] * factor); // G
      data[i + 2] = Math.min(255, data[i + 2] * factor); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    setIsEditing(false);
    saveEditState();
  };

  // 处理擦除
  const handleErase = (x, y, radius = 20) => {
    if (!modalCanvasRef.current || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, radius * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    setIsEditing(false);
    saveEditState();
  };

  // 处理旋转
  const handleRotate = (angle) => {
    if (!modalCanvasRef.current || !initialCanvas || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 计算旋转后的尺寸
    const radians = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    
    // 基于初始画布尺寸计算旋转后的尺寸
    const rotatedWidth = initialCanvas.width; // 保持原始宽度
    const rotatedHeight = initialCanvas.height; // 保持原始高度

    // 调整当前画布大小
    canvas.width = rotatedWidth;
    canvas.height = rotatedHeight;
    canvas.style.width = `${rotatedWidth / dpr}px`;
    canvas.style.height = `${rotatedHeight / dpr}px`;
    
    // 清空当前画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 在当前画布上绘制旋转后的图片
    ctx.save();
    ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
    ctx.rotate(radians);
    ctx.translate(-initialCanvas.width / 2, -initialCanvas.height / 2); // 将图像居中
    ctx.drawImage(initialCanvas, 0, 0);
    ctx.restore();

    setIsEditing(false);
    saveEditState();
  };

  // 处理滑块变化
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    
    switch (editMode) {
      case 'rotate':
        setRotateValue(value);
        handleRotate(value);
        break;
      case 'zoom':
        const scale = value / scaleValue;
        setScaleValue(value);
        handleZoom(scale);
        break;
    }
  };

  // 处理编辑操作
  const handleEdit = (operation) => {
    switch (operation) {
      case 'enhance':
        handleEnhance();
        break;
        
      case 'erase':
        // 这里可以添加擦除相关的交互逻辑
        break;
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (hasEdits) {
      const shouldApply = window.confirm('是否应用当前的编辑更改？');
      if (shouldApply) {
        applyChanges();
      } else {
        setHasEdits(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // 重置编辑状态
  useEffect(() => {
    if (!isOpen) {
      setHasEdits(false);
      setEditHistory([]);
      setCurrentStep(-1);
      setScaleValue(100);
      setRotateValue(0);
      setInitialCanvas(null);
    }
  }, [isOpen]);

  // 处理抠图
  const handleMatting = async () => {
    if (!modalCanvasRef.current || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    
    try {
      // 将canvas转换为base64图片数据
      const imageData = canvas.toDataURL('image/jpeg', 0.8); // 使用JPEG格式和0.8质量以减小数据大小
      // 移除base64前缀
      const base64Data = imageData.split(',')[1];
      
      console.log('Sending matting request...');
      
      // 调用抠图API
      const response = await fetch('/api/matting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image_base64: base64Data
        }),
      });

      console.log('Received response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `抠图请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.code !== 10000) {
        throw new Error(data.message || '抠图处理失败');
      }
      
      if (!data.data?.foreground_image) {
        throw new Error('返回数据中缺少抠图结果');
      }

      // 创建新图片对象
      const img = new Image();
      img.onload = () => {
        // 清空画布
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制抠图结果
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        setIsEditing(false);
        saveEditState();
      };
      
      // 设置图片源为抠图结果
      img.src = `data:image/png;base64,${data.data.foreground_image}`;
    } catch (error) {
      console.error('抠图处理错误:', error);
      alert(error.message || '抠图处理失败，请重试');
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          width: dimensions.width,
          height: dimensions.height * 1.19,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className="modal-header">
            <button className="close-button" onClick={handleClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="edit-canvas-container" style={{ height: '84%' }}>
              <canvas 
                ref={modalCanvasRef}
                className="edit-canvas"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  ...previewStyle
                }}
              />
            </div>
            
            {(editMode === 'zoom' || editMode === 'rotate') && (
              <div className="slider-controls">
                {editMode === 'rotate' && (
                  <div className="slider-group">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotateValue}
                      onChange={handleSliderChange}
                      className="edit-slider"
                    />
                    <span className="slider-value">{rotateValue}°</span>
                  </div>
                )}
                {editMode === 'zoom' && (
                  <div className="slider-group">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={scaleValue}
                      onChange={handleSliderChange}
                      className="edit-slider"
                    />
                    <span className="slider-value">{scaleValue}%</span>
                  </div>
                )}
              </div>
            )}

            <div className="edit-tools">
              <div className="tool-icons">
                {children && React.Children.map(children, child => {
                  if (!child) return null;
                  // 只保留图标，移除文字
                  const iconChild = React.Children.toArray(child.props.children)
                    .find(c => c.type === 'svg' || (c.props && c.props.className === 'button-icon'));
                  return React.cloneElement(child, {
                    onClick: () => handleEdit(editMode),
                    disabled: isEditing,
                    className: 'tool-button icon-only',
                    children: iconChild
                  });
                })}
              </div>
              <div className="action-buttons">
                <button 
                  className="tool-button icon-only apply" 
                  onClick={applyChanges}
                  disabled={isEditing || editHistory.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </button>
                <button 
                  className="tool-button icon-only" 
                  onClick={undo}
                  disabled={isEditing || currentStep <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 14L4 9l5-5" />
                    <path d="M4 9h11a4 4 0 0 1 0 8h-1" />
                  </svg>
                </button>
                <button 
                  className="tool-button icon-only" 
                  onClick={redo}
                  disabled={isEditing || currentStep >= editHistory.length - 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 14l5-5-5-5" />
                    <path d="M20 9H9a4 4 0 0 0 0 8h1" />
                  </svg>
                </button>
                {editMode === 'matting' && (
                  <motion.button 
                    className="tool-button" 
                    onClick={handleMatting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isEditing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="M12 6v12"/>
                      <path d="M6 12h12"/>
                    </svg>
                    <span className="button-text">{isEditing ? '处理中...' : '抠图'}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditModal; 