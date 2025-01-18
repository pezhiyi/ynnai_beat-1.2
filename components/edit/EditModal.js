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
  const [previewStyle, setPreviewStyle] = useState({
    cursor: 'default'
  });
  const [initialCanvas, setInitialCanvas] = useState(null);
  const [eraseRadius, setEraseRadius] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });
  const [showEraser, setShowEraser] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const requestRef = useRef();
  const canvasRect = useRef(null);

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

    // 只有在没有编辑历史时才初始化
    if (editHistory.length === 0) {
      const img = new Image();
      img.onload = () => {
        const imageRatio = img.width / img.height;
        const canvasRatio = dimensions.width / dimensions.height;
        let targetWidth, targetHeight, x, y;

        if (imageRatio > canvasRatio) {
          targetWidth = dimensions.width;
          targetHeight = targetWidth / imageRatio;
          x = 0;
          y = (dimensions.height - targetHeight) / 2;
        } else {
          targetHeight = dimensions.height;
          targetWidth = targetHeight * imageRatio;
          x = (dimensions.width - targetWidth) / 2;
          y = 0;
        }
        
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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
    } else {
      // 如果有编辑历史，加载最后一个状态
      const lastState = editHistory[currentStep];
      if (lastState) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        };
        img.src = lastState;
      }
    }
  }, [isOpen, layers, dimensions, selectedLayer]);

  // 保存编辑状态
  const saveEditState = () => {
    if (!modalCanvasRef.current) {
      console.error('保存状态时画布引用不存在');
      return;
    }
    
    console.log('开始保存编辑状态');
    const canvas = modalCanvasRef.current;
    
    // 获取当前画布状态
    const newState = canvas.toDataURL();
    console.log('获取到新的画布状态');
    
    // 更新历史记录
    setEditHistory(prev => {
      const newHistory = [...prev.slice(0, currentStep + 1), newState];
      console.log('更新历史记录:', {
        previousLength: prev.length,
        newLength: newHistory.length,
        currentStep: currentStep
      });
      return newHistory;
    });
    
    // 更新当前步骤
    setCurrentStep(prev => {
      const newStep = prev + 1;
      console.log('更新当前步骤:', { previous: prev, new: newStep });
      return newStep;
    });
    
    // 标记有编辑
    setHasEdits(true);
    console.log('编辑状态已保存');
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
    if (!modalCanvasRef.current) {
      console.error('加载状态时画布引用不存在');
      return;
    }
    
    console.log('开始加载状态');
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      console.log('状态图片加载成功，尺寸:', img.width, 'x', img.height);
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 计算绘制参数，保持图片比例
      const imageRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      let targetWidth, targetHeight, x, y;

      if (imageRatio > canvasRatio) {
        targetWidth = canvas.width;
        targetHeight = targetWidth / imageRatio;
        x = 0;
        y = (canvas.height - targetHeight) / 2;
      } else {
        targetHeight = canvas.height;
        targetWidth = targetHeight * imageRatio;
        x = (canvas.width - targetWidth) / 2;
        y = 0;
      }
      
      // 绘制图片
      try {
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        console.log('状态已恢复到画布，绘制参数:', {
          x, y, targetWidth, targetHeight,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        });
      } catch (error) {
        console.error('绘制状态图片时出错:', error);
      }
      
      // 强制重新渲染
      setPreviewStyle(prev => ({
        ...prev,
        transform: `scale(${prev.transform ? 1 : 1.0001})`
      }));
    };
    
    img.onerror = (error) => {
      console.error('加载状态图片失败:', error);
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

    // 保持原始分辨率
    canvas.width = initialCanvas.width;
    canvas.height = initialCanvas.height;
    canvas.style.width = `${initialCanvas.width / dpr}px`;
    canvas.style.height = `${initialCanvas.height / dpr}px`;
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 清空原画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 在原画布上进行缩放绘制
    ctx.save();
    // 从中心点进行缩放
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // 使用高质量绘制
    ctx.drawImage(
      initialCanvas, 
      0, 
      0, 
      initialCanvas.width, 
      initialCanvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    setIsEditing(false);
    saveEditState();
  };

  // 处理增强
  const handleEnhance = async () => {
    if (!modalCanvasRef.current || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    
    try {
      console.log('开始图片增强处理');
      
      // 将canvas转换为base64图片数据
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      // 移除base64前缀
      const base64Data = imageData.split(',')[1];
      
      console.log('发送增强请求...');
      
      // 调用增强API
      const response = await fetch('/api/image/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image_base64: base64Data
        }),
      });

      if (!response.ok) {
        throw new Error(`增强请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '增强处理失败');
      }

      // 加载增强后的图片
      const img = new Image();
      img.onload = () => {
        const canvas = modalCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 计算绘制参数
        const imageRatio = img.width / img.height;
        let targetWidth, targetHeight, x, y;

        if (imageRatio > canvas.width / canvas.height) {
          targetWidth = canvas.width;
          targetHeight = canvas.width / imageRatio;
          x = 0;
          y = (canvas.height - targetHeight) / 2;
        } else {
          targetHeight = canvas.height;
          targetWidth = canvas.height * imageRatio;
          x = (canvas.width - targetWidth) / 2;
          y = 0;
        }

        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        saveEditState();
        setIsEditing(false);
      };
      
      img.src = data.data.enhanced_image;
      
    } catch (error) {
      console.error('增强处理失败:', error);
      alert('图片增强失败，请重试');
      setIsEditing(false);
    }
  };

  // 处理抠图
  const handleMatting = async () => {
    if (!modalCanvasRef.current || isEditing) return;
    
    try {
      setIsEditing(true);
      const canvas = modalCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // 显示加载状态
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('正在处理...', canvas.width / 2, canvas.height / 2);
      
      console.log('开始抠图处理');
      
      // 将canvas转换为base64图片数据
      const imageData = canvas.toDataURL('image/jpeg', 0.9); // 提高质量到0.9
      const base64Data = imageData.split(',')[1];
      
      console.log('发送抠图请求...');
      
      // 调用抠图API
      const response = await fetch('/api/image/matting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image_base64: base64Data
        }),
      });

      if (!response.ok) {
        throw new Error(`抠图请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '抠图处理失败');
      }

      // 加载抠图后的图片
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 添加跨域支持
      
      img.onload = () => {
        const canvas = modalCanvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // 恢复画布状态
        ctx.restore();
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 计算绘制参数，保持原始比例
        const imageRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let targetWidth, targetHeight, x, y;

        if (imageRatio > canvasRatio) {
          targetWidth = canvas.width;
          targetHeight = targetWidth / imageRatio;
          x = 0;
          y = (canvas.height - targetHeight) / 2;
        } else {
          targetHeight = canvas.height;
          targetWidth = targetHeight * imageRatio;
          x = (canvas.width - targetWidth) / 2;
          y = 0;
        }

        // 绘制透明背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制抠图结果
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        
        // 保存编辑状态
        saveEditState();
        setIsEditing(false);
      };
      
      img.onerror = (error) => {
        console.error('抠图结果加载失败:', error);
        ctx.restore();
        setIsEditing(false);
        alert('图片加载失败，请重试');
      };
      
      img.src = data.data.foreground_image;
      
    } catch (error) {
      console.error('抠图处理失败:', error);
      const canvas = modalCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.restore();
      }
      alert('抠图失败，请重试');
      setIsEditing(false);
    }
  };

  // 确保在编辑模式为 'matting' 时调用抠图功能
  useEffect(() => {
    if (editMode === 'matting' && modalCanvasRef.current) {
      handleMatting();
    }
  }, [editMode]);

  // 处理擦除
  const handleErase = (point, lastPoint = null) => {
    if (!modalCanvasRef.current || !point) return;

    try {
      const canvas = modalCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // 计算实际的擦除半径（考虑缩放）
      const rect = canvas.getBoundingClientRect();
      const displayToCanvasRatio = canvas.width / rect.width;
      const scaledRadius = eraseRadius * displayToCanvasRatio;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      if (lastPoint && point.canvasX !== lastPoint.canvasX && point.canvasY !== lastPoint.canvasY) {
        // 计算两点之间的距离
        const dx = point.canvasX - lastPoint.canvasX;
        const dy = point.canvasY - lastPoint.canvasY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 根据距离和半径计算插值步数
        const steps = Math.max(Math.ceil(distance / (scaledRadius * 0.5)), 1);
        const stepX = dx / steps;
        const stepY = dy / steps;

        // 使用缓存的路径优化性能
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const x = lastPoint.canvasX + stepX * i;
          const y = lastPoint.canvasY + stepY * i;
          
          if (i === 0) {
            ctx.moveTo(x + scaledRadius, y);
          }
          ctx.arc(x, y, scaledRadius, 0, Math.PI * 2);
        }
        ctx.fill();
      } else {
        // 单点擦除
        ctx.beginPath();
        ctx.arc(point.canvasX, point.canvasY, scaledRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } catch (error) {
      console.error('擦除时出错:', error);
    }
  };

  // 渲染擦除圆圈
  const renderEraseCircle = () => {
    if (editMode !== 'erase') return null;

    const canvas = modalCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const circleSize = eraseRadius * 2;

    return (
      <div
        className="erase-circle"
        style={{
          position: 'fixed',
          left: `${eraserPosition.x}px`,
          top: `${eraserPosition.y}px`,
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          border: '2px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          opacity: isErasing ? 0.9 : 0.7,
          cursor: 'none'
        }}
      />
    );
  };

  // 获取画布上的点坐标
  const getCanvasPoint = (event) => {
    if (!modalCanvasRef.current) return null;
    
    const canvas = modalCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    try {
      let clientX, clientY;
      if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      if (typeof clientX !== 'number' || typeof clientY !== 'number') {
        return null;
      }

      // 计算画布上的实际坐标
      const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
      const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

      return {
        canvasX,
        canvasY,
        clientX,
        clientY
      };
    } catch (error) {
      console.error('获取坐标时出错:', error);
      return null;
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e) => {
    if (editMode !== 'erase') return;
    try {
      e.preventDefault();
      e.stopPropagation();
      
      const point = getCanvasPoint(e);
      if (!point) return;

      setIsErasing(true);
      setLastPoint(point);
      updateEraserPosition(point);
      handleErase(point);
    } catch (error) {
      console.error('触摸开始时出错:', error);
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e) => {
    if (editMode !== 'erase') return;
    try {
      e.preventDefault();
      e.stopPropagation();
      
      const point = getCanvasPoint(e);
      if (!point) return;

      updateEraserPosition(point);

      if (isErasing && lastPoint) {
        handleErase(point, lastPoint);
        setLastPoint(point);
      }
    } catch (error) {
      console.error('触摸移动时出错:', error);
    }
  };

  // 处理触摸结束
  const handleTouchEnd = (e) => {
    if (editMode !== 'erase') return;
    try {
      e.preventDefault();
      e.stopPropagation();
      
      setIsErasing(false);
      setLastPoint(null);
      saveEditState();
    } catch (error) {
      console.error('触摸结束时出错:', error);
    }
  };

  // 处理变换
  const handleTransform = (scale, rotate) => {
    if (!modalCanvasRef.current || !initialCanvas) return;

    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存当前状态
    ctx.save();

    // 设置变换中心点为画布中心
    ctx.translate(canvas.width / (2 * dpr), canvas.height / (2 * dpr));
    
    // 应用旋转和缩放
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale / 100, scale / 100);

    // 绘制图像，需要将原点移回去
    ctx.drawImage(
      initialCanvas,
      -canvas.width / (2 * dpr),
      -canvas.height / (2 * dpr),
      canvas.width / dpr,
      canvas.height / dpr
    );

    // 恢复状态
    ctx.restore();

    // 保存编辑状态
    requestAnimationFrame(() => {
      saveEditState();
    });
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
        setScaleValue(value);
        handleTransform(value, rotateValue);
        break;
      case 'erase':
        setEraseRadius(value);
        break;
      default:
        break;
    }
  };

  // 处理旋转
  const handleRotate = (angle) => {
    if (!modalCanvasRef.current || !initialCanvas || isEditing) return;
    
    setIsEditing(true);
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 保持原始尺寸，不进行缩放
    canvas.width = initialCanvas.width;
    canvas.height = initialCanvas.height;
    canvas.style.width = `${initialCanvas.width / dpr}px`;
    canvas.style.height = `${initialCanvas.height / dpr}px`;
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 清空当前画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 在当前画布上绘制旋转后的图片
    ctx.save();
    
    // 移动到画布中心进行旋转
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // 旋转角度
    const radians = (angle * Math.PI) / 180;
    ctx.rotate(radians);
    
    // 绘制图片，保持原始尺寸
    ctx.drawImage(
      initialCanvas,
      -initialCanvas.width / 2,
      -initialCanvas.height / 2,
      initialCanvas.width,
      initialCanvas.height
    );
    
    ctx.restore();

    setIsEditing(false);
    saveEditState();
  };

  // 处理编辑操作
  const handleEdit = (operation) => {
    console.log('处理编辑操作:', operation);
    switch (operation) {
      case 'matting':
        handleMatting();
        break;
      case 'enhance':
        handleEnhance();
        break;
      case 'erase':
        handleErase();
        break;
      case 'rotate':
        handleRotate();
        break;
      case 'zoom':
        handleZoom();
        break;
      default:
        console.warn('未知的编辑操作:', operation);
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

  // 处理鼠标事件
  const handlePointerDown = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    if (!point) return;

    setIsErasing(true);
    setLastPoint(point);
    updateEraserPosition(point);
    handleErase(point);
  };

  const handlePointerMove = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    if (!point) return;

    updateEraserPosition(point);

    if (isErasing && lastPoint) {
      handleErase(point, lastPoint);
      setLastPoint(point);
    }
  };

  const handlePointerUp = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();
    
    setIsErasing(false);
    setLastPoint(null);
    saveEditState();
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    if (!point) return;

    updateEraserPosition(point);
  };

  // 处理鼠标按下
  const handleMouseDown = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();
    
    const point = getCanvasPoint(e);
    if (!point) return;

    setIsErasing(true);
    setLastPoint(point);
    updateEraserPosition(point);
    handleErase(point);
  };

  // 处理鼠标抬起
  const handleMouseUp = (e) => {
    if (editMode !== 'erase') return;
    e.preventDefault();

    setIsErasing(false);
    setLastPoint(null);
    saveEditState();
  };

  // 更新擦除器位置
  const updateEraserPosition = (point) => {
    if (!point || !modalCanvasRef.current) return;
    
    const canvas = modalCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // 使用精确的像素位置
    setEraserPosition({
      x: Math.round(point.clientX),
      y: Math.round(point.clientY)
    });
  };

  // 添加事件监听
  useEffect(() => {
    if (!modalCanvasRef.current || editMode !== 'erase') {
      return;
    }

    const canvas = modalCanvasRef.current;
    const options = { passive: false };
    
    // 鼠标事件
    canvas.addEventListener('mousedown', handleMouseDown, options);
    canvas.addEventListener('mousemove', handleMouseMove, options);
    canvas.addEventListener('mouseup', handleMouseUp, options);
    canvas.addEventListener('mouseleave', handleMouseUp, options);
    
    // 触摸事件
    canvas.addEventListener('touchstart', handleTouchStart, options);
    canvas.addEventListener('touchmove', handleTouchMove, options);
    canvas.addEventListener('touchend', handleTouchEnd, options);
    canvas.addEventListener('touchcancel', handleTouchEnd, options);

    // 设置初始位置
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setEraserPosition({
      x: Math.round(centerX),
      y: Math.round(centerY)
    });

    return () => {
      // 移除事件监听
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [editMode]);

  // 更新鼠标样式
  useEffect(() => {
    if (modalCanvasRef.current) {
      modalCanvasRef.current.style.cursor = editMode === 'erase' ? 'none' : 'default';
    }
  }, [editMode]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 10
            }}
          />
          <motion.div
            className="edit-modal"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <button className="close-button" onClick={handleClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div 
                className="edit-canvas-container"
                style={{ 
                  height: '84%', 
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.6rem',
                  backdropFilter: 'blur(4px)',                  
                  WebkitBackdropFilter: 'blur(4px)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas 
                  ref={modalCanvasRef}
                  className="edit-canvas"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    ...previewStyle,
                    touchAction: editMode === 'erase' ? 'none' : 'auto',  // 防止触摸事件的默认行为
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                />
                {renderEraseCircle()}
              </div>
              
              {(editMode === 'zoom' || editMode === 'rotate' || editMode === 'erase') && (
                <div className="slider-controls">
                  {editMode === 'rotate' && (
                    <div className="slider-group" data-type="rotate">
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
                    <div className="slider-group" data-type="zoom">
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
                  {editMode === 'erase' && (
                    <div className="slider-group" data-type="erase">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={eraseRadius}
                        onChange={handleSliderChange}
                        className="edit-slider"
                        style={{
                          width: '200px',
                          margin: '0 10px'
                        }}
                      />
                      <span className="slider-value">{eraseRadius}px</span>
                    </div>
                  )}
                </div>
              )}

              <div className="edit-tools">
                <div className="tool-icons">
                  {children && React.Children.map(children, (child, index) => {
                    if (!child) return null;
                    // 获取按钮的图标和文字
                    const iconChild = React.Children.toArray(child.props.children)
                      .find(c => c.type === 'svg' || (c.props && c.props.className === 'button-icon'));
                    const textChild = React.Children.toArray(child.props.children)
                      .find(c => c.type === 'span' && c.props.className === 'button-text');
                    
                    return (
                      <motion.button 
                        onClick={() => handleEdit(editMode)}
                        disabled={isEditing}
                        className="tool-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '0.6rem',
                          color: 'rgba(0, 0, 0, 0.8)',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {iconChild}
                        {textChild}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="action-buttons">
                  <motion.button 
                    className="tool-button" 
                    onClick={applyChanges}
                    disabled={isEditing || editHistory.length <= 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      padding: '0.5rem',
                      borderRadius: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </motion.button>
                  <motion.button 
                    className="tool-button" 
                    onClick={undo}
                    disabled={isEditing || currentStep <= 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      padding: '0.5rem',
                      borderRadius: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 14L4 9l5-5" />
                      <path d="M4 9h11a4 4 0 0 1 0 8h-1" />
                    </svg>
                  </motion.button>
                  <motion.button 
                    className="tool-button" 
                    onClick={redo}
                    disabled={isEditing || currentStep >= editHistory.length - 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      padding: '0.5rem',
                      borderRadius: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 14l5-5-5-5" />
                      <path d="M20 9H9a4 4 0 0 0 0 8h1" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditModal; 