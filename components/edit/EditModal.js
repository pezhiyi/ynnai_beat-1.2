import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const EditModal = ({ 
  isOpen, 
  onClose, 
  layer,
  onConfirm,
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
  const requestRef = useRef();
  const canvasRect = useRef(null);
  const [currentTransform, setCurrentTransform] = useState(null);
  const [tempImageData, setTempImageData] = useState(null);

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
    if (!isOpen || !layer || !modalCanvasRef.current) return;

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

      if (layer) {
        img.src = layer.src;
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
  }, [isOpen, layer, dimensions]);

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
    ctx.scale(scale / 100, scale / 100);
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
        handleTransform(scaleValue, value);
        break;
      case 'zoom':
        setScaleValue(value);
        handleTransform(value, rotateValue);
        break;
      default:
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

  // 处理确认
  const handleConfirm = (transform) => {
    if (transform?.type === 'erase') {
      onConfirm(transform);
    } else if (currentTransform) {
      onConfirm(currentTransform);
    }
    setCurrentTransform(null);
    setTempImageData(null);
    // 使用 setTimeout 确保状态更新完成后再关闭
    setTimeout(() => {
      onClose();
    }, 0);
  };

  // 处理取消
  const handleCancel = () => {
    setCurrentTransform(null);
    setTempImageData(null);
    // 使用 setTimeout 确保状态更新完成后再关闭
    setTimeout(() => {
      onClose();
    }, 0);
  };

  // 处理变换更改
  const handleTransformChange = (transform) => {
    if (transform.type === 'erase') {
      setTempImageData(transform.value);
    } else {
      setCurrentTransform(transform);
    }
  };

  // 处理鼠标事件
  const handlePointerDown = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  const handlePointerMove = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  // 处理鼠标按下
  const handleMouseDown = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  // 处理鼠标抬起
  const handleMouseUp = (e) => {
    if (editMode === 'matting' || editMode === 'enhance') {
      e.preventDefault();
    }
  };

  // 添加事件监听
  useEffect(() => {
    if (!modalCanvasRef.current) {
      return;
    }

    const canvas = modalCanvasRef.current;
    const options = { passive: false };
    
    canvas.addEventListener('mousedown', handleMouseDown, options);
    canvas.addEventListener('mousemove', handleMouseMove, options);
    canvas.addEventListener('mouseup', handleMouseUp, options);
    canvas.addEventListener('mouseleave', handleMouseUp, options);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [editMode]);

  // 更新鼠标样式
  useEffect(() => {
    if (modalCanvasRef.current) {
      modalCanvasRef.current.style.cursor = 'default';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        maxW="90vw"
        maxH="90vh"
        bg="gray.800"
        color="white"
      >
        <ModalHeader p={4}>
          编辑图层
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={4}>
          <ImageEditor
            layer={layer}
            onTransformChange={handleTransformChange}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            initialTransform={currentTransform}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;