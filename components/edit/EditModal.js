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
      console.log('状态图片加载成功:', {
        width: img.width,
        height: img.height
      });
      
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

      console.log('收到响应:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `增强请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('响应数据:', data);
      
      if (!data.success) {
        throw new Error(data.message || '增强处理失败');
      }
      
      if (!data.data?.enhanced_image) {
        throw new Error('返回数据中缺少增强结果');
      }

      // 创建新图片对象
      const img = new Image();
      
      img.onerror = (error) => {
        console.error('图片加载失败:', error);
        setIsEditing(false);
        alert('图片加载失败，请重试');
      };
      
      img.onload = () => {
        console.log('增强后的图片加载成功，尺寸:', img.width, 'x', img.height);
        
        // 确保画布引用存在
        if (!modalCanvasRef.current) {
          console.error('画布引用不存在');
          return;
        }
        
        const canvas = modalCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // 输出当前画布状态
        console.log('当前画布状态:', {
          width: canvas.width,
          height: canvas.height,
          style: {
            width: canvas.style.width,
            height: canvas.style.height
          }
        });
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 计算绘制参数
        const dpr = window.devicePixelRatio || 1;
        console.log('设备像素比:', dpr);
        
        // 确保画布尺寸正确
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
        
        // 设置绘制上下文的缩放
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
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
        
        console.log('绘制增强后的图片，参数:', {
          imageRatio,
          canvasRatio,
          x, y, 
          targetWidth, 
          targetHeight,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        });
        
        // 绘制增强结果
        try {
          ctx.drawImage(img, x, y, targetWidth, targetHeight);
          console.log('增强后的图片绘制完成');
          
          // 保存状态并更新UI
          setIsEditing(false);
          saveEditState();
          
          // 强制重新渲染
          setPreviewStyle(prev => ({
            ...prev,
            transform: `scale(${prev.transform ? 1 : 1.0001})`
          }));
        } catch (error) {
          console.error('绘制增强后的图片时出错:', error);
          throw error;
        }
      };
      
      // 设置图片源为增强结果
      console.log('开始加载增强后的图片数据');
      img.crossOrigin = 'anonymous'; // 添加跨域支持
      img.src = data.data.enhanced_image; // 移除额外的格式转换参数
    } catch (error) {
      console.error('增强处理失败:', error);
      setIsEditing(false);
      alert(error.message || '增强处理失败，请重试');
    }
  };

  // 处理擦除
  const handleErase = (x, y, lastX, lastY) => {
    if (!modalCanvasRef.current || isEditing) return;
    
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    ctx.globalCompositeOperation = 'destination-out';
    
    if (lastX !== undefined && lastY !== undefined) {
      // 使用二次贝塞尔曲线实现平滑擦除
      const controlX = (lastX + x) / 2;
      const controlY = (lastY + y) / 2;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.quadraticCurveTo(
        controlX, 
        controlY,
        x, 
        y
      );
      ctx.lineWidth = eraseRadius * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else {
      // 单点擦除
      ctx.beginPath();
      ctx.arc(x, y, eraseRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalCompositeOperation = 'source-over';
  };

  // 更新事件监听器
  useEffect(() => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    const getCanvasPoint = (touch) => {
      if (!canvasRect.current) {
        canvasRect.current = canvas.getBoundingClientRect();
      }
      
      // 计算相对于画布的坐标
      const x = touch.clientX - canvasRect.current.left;
      const y = touch.clientY - canvasRect.current.top;
      
      return { x, y };
    };

    const handleTouchStart = (e) => {
      if (editMode !== 'erase') return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const point = getCanvasPoint(touch);
      
      setIsDrawing(true);
      setLastPoint(point);
      setEraserPosition(point);
      handleErase(point.x, point.y);
    };

    const handleTouchMove = (e) => {
      if (editMode !== 'erase') return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const point = getCanvasPoint(touch);
      
      setEraserPosition(point);
      
      if (isDrawing && lastPoint) {
        handleErase(point.x, point.y, lastPoint.x, lastPoint.y);
        setLastPoint(point);
      }
    };

    const handleTouchEnd = (e) => {
      if (editMode !== 'erase') return;
      
      e.preventDefault();
      setIsDrawing(false);
      setLastPoint(null);
      canvasRect.current = null;
      saveEditState();
    };

    if (editMode === 'erase') {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [editMode, isDrawing]);

  // 处理鼠标事件
  const handleMouseDown = (e) => {
    if (editMode !== 'erase') return;
    
    if (!canvasRect.current) {
      canvasRect.current = modalCanvasRef.current.getBoundingClientRect();
    }
    
    const x = e.clientX - canvasRect.current.left;
    const y = e.clientY - canvasRect.current.top;
    
    setIsDrawing(true);
    setLastPoint({ x, y });
    setEraserPosition({ x, y });
    handleErase(x, y);
  };

  const handleMouseMove = (e) => {
    if (editMode !== 'erase') return;
    
    if (!canvasRect.current) {
      canvasRect.current = modalCanvasRef.current.getBoundingClientRect();
    }
    
    const x = e.clientX - canvasRect.current.left;
    const y = e.clientY - canvasRect.current.top;
    
    setEraserPosition({ x, y });
    
    if (isDrawing && lastPoint) {
      handleErase(x, y, lastPoint.x, lastPoint.y);
      setLastPoint({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (editMode !== 'erase') return;
    
    setIsDrawing(false);
    setLastPoint(null);
    canvasRect.current = null;
    saveEditState();
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

  // 处理滑块变化
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    
    switch (editMode) {
      case 'rotate':
        setRotateValue(value);
        handleRotate(value);
        break;
      case 'zoom':
        const scale = value / 100;
        setScaleValue(value);
        handleZoom(scale);
        break;
      case 'erase':
        setEraseRadius(value);
        break;
    }
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
      const response = await fetch('/api/image/matting', {
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
      
      if (!data.success) {
        throw new Error(data.message || '抠图处理失败');
      }
      
      if (!data.data?.foreground_image) {
        throw new Error('返回数据中缺少抠图结果');
      }

      // 创建新图片对象
      const img = new Image();
      
      img.onerror = (error) => {
        console.error('图片加载失败:', error);
        setIsEditing(false);
        alert('图片加载失败，请重试');
      };
      
      img.onload = () => {
        console.log('图片加载成功，尺寸:', img.width, 'x', img.height);
        
        // 确保画布引用存在
        if (!modalCanvasRef.current) {
          console.error('画布引用不存在');
          return;
        }
        
        const canvas = modalCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // 输出当前画布状态
        console.log('当前画布状态:', {
          width: canvas.width,
          height: canvas.height,
          style: {
            width: canvas.style.width,
            height: canvas.style.height
          }
        });
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 计算绘制参数
        const dpr = window.devicePixelRatio || 1;
        console.log('设备像素比:', dpr);
        
        // 确保画布尺寸正确
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
        
        // 设置绘制上下文的缩放
        ctx.scale(dpr, dpr);
        
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
        
        console.log('绘制参数:', {
          imageRatio,
          canvasRatio,
          x, y, 
          targetWidth, 
          targetHeight,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        });
        
        // 绘制抠图结果
        try {
          ctx.drawImage(img, x, y, targetWidth, targetHeight);
          console.log('图片绘制完成');
        } catch (error) {
          console.error('绘制图片时出错:', error);
        }
        
        // 保存状态并更新UI
        setIsEditing(false);
        saveEditState();
        
        // 强制重新渲染
        setPreviewStyle(prev => ({
          ...prev,
          transform: `scale(${prev.transform ? 1 : 1.0001})`
        }));
      };
      
      // 设置图片源为抠图结果（现在是 base64 数据）
      console.log('开始加载图片数据');
      img.src = data.data.foreground_image; // 已经是完整的 base64 数据了
    } catch (error) {
      console.error('抠图处理错误:', error);
      alert(error.message || '抠图处理失败，请重试');
      setIsEditing(false);
    }
  };

  // 修改鼠标/触摸事件处理函数
  const handlePointerDown = (e) => {
    if (editMode !== 'erase') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    setIsErasing(true);
    setEraserPosition({ x, y });
    handleErase(x, y);
  };

  const handlePointerMove = (e) => {
    if (editMode !== 'erase') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || (e.touches?.[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches?.[0]?.clientY)) - rect.top;
    
    setEraserPosition({ x, y });
    
    if (isErasing) {
      handleErase(x, y);
    }
  };

  const handlePointerUp = () => {
    setIsErasing(false);
  };

  // 修改 useEffect 中的鼠标样式更新
  useEffect(() => {
    setPreviewStyle(prev => ({
      ...prev,
      cursor: editMode === 'erase' ? 'none' : 'default'
    }));
    setShowEraser(editMode === 'erase');
  }, [editMode]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="modal-backdrop"
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          key="modal-content"
          className="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
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
                  ...previewStyle
                }}
              />
              {showEraser && (
                <div
                  className="eraser-preview"
                  style={{
                    position: 'absolute',
                    left: eraserPosition.x,
                    top: eraserPosition.y,
                    width: eraseRadius * 2,
                    height: eraseRadius * 2,
                    border: '2px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.2s, height 0.2s',
                    zIndex: 1000
                  }}
                />
              )}
            </div>
            
            {(editMode === 'zoom' || editMode === 'rotate' || editMode === 'erase') && (
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
                {editMode === 'erase' && (
                  <div className="slider-group">
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
      </motion.div>
    </AnimatePresence>
  );
};

export default EditModal; 