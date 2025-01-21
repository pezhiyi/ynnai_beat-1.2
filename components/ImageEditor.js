import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/modules/components/image-editor.module.css';
import sliderStyles from '../styles/modules/components/slider.module.css';

// 添加防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const ImageEditor = ({ layer, onTransformChange, onConfirm, onCancel, initialTransform }) => {
  const targetRef = useRef(null);
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const eraseCanvasRef = useRef(null);
  const fullscreenCanvasRef = useRef(null);
  const mattingCanvasRef = useRef(null);
  const [transform, setTransform] = useState(initialTransform || {
    rotate: 0,
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  const [activeControl, setActiveControl] = useState(null);
  const [isErasing, setIsErasing] = useState(false);
  const [isMatting, setIsMatting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [eraserPosition, setEraserPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isProcessing, setIsProcessing] = useState(false);

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

      // 计算图片显示尺寸
      const imageRatio = layer.width / layer.height;
      let targetWidth, targetHeight, x, y;

      if (imageRatio === 1) {
        const size = Math.min(containerWidth, containerHeight);
        targetWidth = size;
        targetHeight = size;
        x = (containerWidth - size) / 2;
        y = (containerHeight - size) / 2;
      } else if (imageRatio > 1) {
        targetWidth = containerWidth;
        targetHeight = containerWidth / imageRatio;
        x = 0;
        y = (containerHeight - targetHeight) / 2;
      } else {
        targetHeight = containerHeight;
        targetWidth = containerHeight * imageRatio;
        x = (containerWidth - targetWidth) / 2;
        y = 0;
      }

      // 设置图片初始尺寸
      imgElement.style.width = `${targetWidth}px`;
      imgElement.style.height = `${targetHeight}px`;

      // 应用变换，以图片中心为基准点
      img.style.transform = `
        translate(${x + transform.translateX}px, ${y + transform.translateY}px)
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
    const rotate = parseInt(e.target.value);
    setTransform(prev => ({
      ...prev,
      rotate
    }));
    onTransformChange({
      type: 'rotate',
      value: rotate
    });
  };

  // 处理缩放变化
  const handleScaleChange = (e) => {
    const scale = parseFloat(e.target.value);
    setTransform(prev => ({
      ...prev,
      scale
    }));
    onTransformChange({
      type: 'scale',
      value: scale
    });
  };

  // 处理擦除模式的切换
  useEffect(() => {
    if (activeControl === 'erase' && !isErasing) {
      setIsErasing(true);
      // 初始化擦除画布
      const canvas = eraseCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // 清除画布，确保透明背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = layer.src;
    } else if (activeControl !== 'erase') {
      setIsErasing(false);
      setIsFullscreen(false);
    }
  }, [activeControl, layer.src]);

  // 处理抠图模式切换
  useEffect(() => {
    if (activeControl === 'matting' && !isMatting) {
      setIsMatting(true);
      // 初始化抠图画布
      const canvas = mattingCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // 清除画布，确保透明背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = layer.src;
    } else if (activeControl !== 'matting') {
      setIsMatting(false);
    }
  }, [activeControl, layer.src]);

  // 处理全屏预览的初始化
  useEffect(() => {
    if (isFullscreen && fullscreenCanvasRef.current) {
      const canvas = fullscreenCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 获取设备像素比
        const dpr = window.devicePixelRatio || 1;
        
        // 设置画布的实际大小（物理像素）
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        
        // 设置画布的显示大小（CSS像素）
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        
        // 缩放上下文以匹配设备像素比
        ctx.scale(dpr, dpr);
        
        // 计算图片的缩放比例，使其完整显示在画布中并保持纵横比
        const padding = 40; // 添加内边距
        const scale = Math.min(
          (window.innerWidth - padding * 2) / img.width,
          (window.innerHeight - padding * 2) / img.height
        );
        
        // 计算居中位置
        const x = (window.innerWidth - img.width * scale) / 2;
        const y = (window.innerHeight - img.height * scale) / 2;
        
        // 启用图像平滑
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 清除画布，确保透明背景
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        // 绘制图片
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 存储图片信息用于擦除
        canvas.imageInfo = {
          scale,
          x,
          y,
          width: img.width * scale,
          height: img.height * scale,
          dpr,
          originalWidth: img.width,
          originalHeight: img.height
        };
      };
      img.src = layer.src;
    }
  }, [isFullscreen, layer.src]);

  // 处理全屏预览的关闭
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // 获取两点之间的所有点
  const getPointsOnLine = (x1, y1, x2, y2) => {
    const points = [];
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.max(Math.ceil(distance / (20 / 2)), 1); // 使用固定大小
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t
      });
    }
    
    return points;
  };

  // 擦除函数
  const erase = (x, y) => {
    const canvas = fullscreenCanvasRef.current;
    if (!canvas || !canvas.imageInfo) return;
    
    const ctx = canvas.getContext('2d');
    const { scale, x: imgX, y: imgY, width, height, dpr } = canvas.imageInfo;
    
    // 检查是否在图片范围内
    if (x < imgX || x > imgX + width || y < imgY || y > imgY + height) return;

    // 保存当前状态
    ctx.save();
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 设置混合模式为清除
    ctx.globalCompositeOperation = 'destination-out';
    
    // 创建擦除路径
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    
    // 使用径向渐变创建柔和的擦除效果
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 恢复状态
    ctx.restore();

    // 标记有更改
    setHasChanges(true);
  };

  // 使用防抖更新预览画布
  const updatePreviewCanvas = useCallback(
    debounce(() => {
      const canvas = fullscreenCanvasRef.current;
      const previewCanvas = eraseCanvasRef.current;
      if (!canvas || !previewCanvas || !canvas.imageInfo) return;

      const { x: imgX, y: imgY, width, height, dpr } = canvas.imageInfo;
      const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
      
      // 创建临时画布来保存当前状态
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      
      // 设置为原始图片尺寸
      tempCanvas.width = canvas.imageInfo.originalWidth;
      tempCanvas.height = canvas.imageInfo.originalHeight;
      
      // 启用高质量渲染
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      
      // 将全屏画布内容缩放到原始尺寸
      tempCtx.drawImage(
        canvas,
        imgX * dpr,
        imgY * dpr,
        width * dpr,
        height * dpr,
        0,
        0,
        canvas.imageInfo.originalWidth,
        canvas.imageInfo.originalHeight
      );
      
      // 更新预览画布
      previewCanvas.width = canvas.imageInfo.originalWidth;
      previewCanvas.height = canvas.imageInfo.originalHeight;
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.imageSmoothingEnabled = true;
      previewCtx.imageSmoothingQuality = 'high';
      previewCtx.drawImage(tempCanvas, 0, 0);
    }, 100),
    []
  );

  // 处理鼠标事件
  const handleMouseDown = (e) => {
    if (!isFullscreen) return;
    setIsDrawing(true);
    const canvas = fullscreenCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const pos = {
      x: (e.clientX - rect.left) / dpr,
      y: (e.clientY - rect.top) / dpr
    };
    
    setLastPos(pos);
    erase(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (!isFullscreen || !isDrawing) return;
    const canvas = fullscreenCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const currentPos = {
      x: (e.clientX - rect.left) / dpr,
      y: (e.clientY - rect.top) / dpr
    };
    
    // 更新橡皮擦预览位置
    setEraserPosition({ x: e.clientX, y: e.clientY });
    
    // 在当前点和上一个点之间绘制线段
    const points = getPointsOnLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y);
    points.forEach(point => {
      erase(point.x, point.y);
    });
    
    setLastPos(currentPos);
    updatePreviewCanvas();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 触摸事件处理函数
  const handleTouchStart = (e) => {
    e.preventDefault(); // 阻止默认行为
    if (!isFullscreen) return;
    setIsTouching(true);
    
    const touch = e.touches[0];
    const canvas = fullscreenCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 直接使用触摸坐标，不进行DPR转换
    const pos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    setLastPos(pos);
    erase(pos.x, pos.y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // 阻止默认行为
    if (!isFullscreen || !isTouching) return;
    
    const touch = e.touches[0];
    const canvas = fullscreenCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 更新橡皮擦预览位置
    setEraserPosition({ x: touch.clientX, y: touch.clientY });
    
    // 直接使用触摸坐标，不进行DPR转换
    const currentPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    // 在当前点和上一个点之间绘制线段
    const points = getPointsOnLine(lastPos.x, lastPos.y, currentPos.x, currentPos.y);
    points.forEach(point => {
      erase(point.x, point.y);
    });
    
    setLastPos(currentPos);
    updatePreviewCanvas();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault(); // 阻止默认行为
    setIsTouching(false);
  };

  // 处理擦除确认
  const handleEraseConfirm = () => {
    const canvas = fullscreenCanvasRef.current;
    if (!canvas || !canvas.imageInfo) return;
    
    // 创建一个临时画布来保存结果
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    // 设置临时画布的尺寸为原图尺寸
    tempCanvas.width = canvas.imageInfo.originalWidth;
    tempCanvas.height = canvas.imageInfo.originalHeight;
    
    // 启用图像平滑并确保透明背景
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // 将全屏画布的内容缩放回原始大小
    tempCtx.drawImage(
      canvas,
      canvas.imageInfo.x * canvas.imageInfo.dpr,
      canvas.imageInfo.y * canvas.imageInfo.dpr,
      canvas.imageInfo.width * canvas.imageInfo.dpr,
      canvas.imageInfo.height * canvas.imageInfo.dpr,
      0,
      0,
      canvas.imageInfo.originalWidth,
      canvas.imageInfo.originalHeight
    );
    
    // 转换为 base64 并更新，使用高质量设置
    const newImageData = tempCanvas.toDataURL('image/png', 1.0);

    // 更新预览画布
    const previewCanvas = eraseCanvasRef.current;
    if (previewCanvas) {
      const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
      const img = new Image();
      img.onload = () => {
        // 设置预览画布为原图尺寸
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        
        // 启用图像平滑并确保透明背景
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
        
        previewCtx.drawImage(img, 0, 0);
      };
      img.src = newImageData;
    }

    // 通知父组件但不直接应用更改
    onConfirm({
      type: 'erase',
      value: newImageData,
      layer: layer
    });
    
    // 标记有更改
    setHasChanges(true);
    
    // 关闭全屏模式但保持擦除模式
    setIsFullscreen(false);
  };

  // 处理擦除取消
  const handleEraseCancel = () => {
    // 重置预览画布到原始状态
    const canvas = eraseCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = layer.src;
    }
    
    // 关闭全屏模式但保持擦除模式
    setIsFullscreen(false);
  };

  // 处理全屏模式的键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // 处理触摸事件的视觉反馈
  useEffect(() => {
    if (isFullscreen && fullscreenCanvasRef.current) {
      const canvas = fullscreenCanvasRef.current;
      
      // 添加触摸反馈样式
      canvas.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isFullscreen]);

  // 添加点击外部关闭功能
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  // 处理抠图
  const handleMatting = async () => {
    try {
      setIsProcessing(true);
      console.log('开始抠图处理');
      
      // 获取当前画布的图片数据
      const canvas = mattingCanvasRef.current;
      if (!canvas) {
        throw new Error('画布未初始化');
      }
      
      console.log('获取画布数据');
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = imageData.split(',')[1];

      console.log('调用抠图API');
      // 调用抠图API
      const response = await fetch('/api/image/matting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64Data
        })
      });

      console.log('API响应状态:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        throw new Error(`抠图处理失败: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('API返回结果:', result);
      
      if (!result.success) {
        throw new Error(result.message || '抠图处理失败');
      }

      // 在画布上显示抠图结果
      console.log('开始加载抠图结果');
      const img = new Image();
      img.onload = () => {
        console.log('抠图结果加载完成，更新画布');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasChanges(true);
        setIsProcessing(false);
      };
      img.onerror = (error) => {
        console.error('抠图结果图片加载失败:', error);
        setIsProcessing(false);
        throw new Error('抠图结果图片加载失败');
      };
      img.src = result.data.foreground_image;

    } catch (error) {
      console.error('抠图处理错误:', error);
      setIsProcessing(false);
      // 这里可以添加错误提示UI
      alert(error.message || '抠图处理失败，请重试');
    }
  };

  // 应用抠图结果到主画布
  const applyMattingResult = () => {
    if (!mattingCanvasRef.current) return;
    
    const mattingResult = mattingCanvasRef.current.toDataURL();
    
    // 先更新主画布
    onConfirm({
      type: 'matting',
      value: mattingResult,
      layer: layer
    });

    // 等待一帧后再关闭模态框并重置
    requestAnimationFrame(() => {
      // 重置变换
      setTransform({
        rotate: 0,
        scale: 1,
        translateX: 0,
        translateY: 0
      });
      onTransformChange({
        type: 'reset'
      });

      // 重置状态
      setActiveControl(null);
      setIsMatting(false);
      setHasChanges(false);
      setIsProcessing(false);
    });
  };

  return (
    <motion.div
      ref={editorRef}
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className={styles.editor}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fff',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        padding: '12px 12px 20px', 
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* 顶部标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '500',
          color: 'rgba(0, 0, 0, 0.8)'
        }}>
          编辑图层
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
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
              setActiveControl(null);
            }}
            data-action="reset"
            style={{
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <span style={{ fontSize: '14px' }}>↺</span>
            重置
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <span style={{ 
              fontSize: '14px',
              lineHeight: 1,
              color: 'rgba(0, 0, 0, 0.5)'
            }}>×</span>
            <span>关闭</span>
          </button>
        </div>
      </div>

      {/* 控制按钮组 */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0 4px'
      }}>
        <button
          className={`${styles.functionButton} ${activeControl === 'rotate' ? styles.active : ''}`}
          onClick={() => setActiveControl('rotate')}
        >
          <span className={styles.functionIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round"/>
              <path d="M3 3v5h5" strokeLinecap="round"/>
            </svg>
          </span>
          旋转
        </button>
        <button
          className={`${styles.functionButton} ${activeControl === 'scale' ? styles.active : ''}`}
          onClick={() => setActiveControl('scale')}
        >
          <span className={styles.functionIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round"/>
            </svg>
          </span>
          缩放
        </button>
        <button
          className={`${styles.functionButton} ${activeControl === 'erase' ? styles.active : ''}`}
          onClick={() => setActiveControl('erase')}
        >
          <span className={styles.functionIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 20H4" strokeLinecap="round"/>
              <path d="M4 16l4-8 4 8" strokeLinecap="round"/>
              <path d="M16 8l4 8" strokeLinecap="round"/>
              <path d="M12 16v-4" strokeLinecap="round"/>
            </svg>
          </span>
          擦除
        </button>
        <button
          className={`${styles.functionButton} ${activeControl === 'matting' ? styles.active : ''}`}
          onClick={() => setActiveControl('matting')}
        >
          <span className={styles.functionIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 4h10M4 7v10M20 7v10M7 20h10" strokeLinecap="round"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </span>
          抠图
        </button>
      </div>

      {/* 图片预览 */}
      <div 
        style={{
          flex: 1,
          overflow: 'hidden',
          background: 'rgba(0, 0, 0, 0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div 
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div
            ref={targetRef}
            style={{
              position: 'absolute',
              transformOrigin: 'center center'
            }}
          >
            <img
              src={layer.src}
              alt={layer.name}
              onLoad={handleImageLoad}
              style={{
                display: 'block',
                userSelect: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <AnimatePresence>
        {activeControl === 'erase' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                background: '#fff',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setIsFullscreen(true)}
            >
              <canvas
                ref={eraseCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1]
                }}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '24px',
                  padding: '10px 20px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  pointerEvents: 'none',
                  transform: 'translateY(0px)',
                  animation: 'float 2s ease-in-out infinite'
                }}
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round"/>
                  <path d="M3 3v5h5" strokeLinecap="round"/>
                </svg>
                点击放大擦除
              </motion.div>
              <style jsx global>{`
                @keyframes float {
                  0% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-6px);
                  }
                  100% {
                    transform: translateY(0px);
                  }
                }
              `}</style>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              marginTop: '12px',
              padding: '0 12px'
            }}>
              <button
                onClick={() => {
                  setActiveControl(null);
                  setIsErasing(false);
                  onCancel();
                }}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  onConfirm({
                    type: 'erase',
                    value: eraseCanvasRef.current.toDataURL(),
                    layer: layer
                  });
                  setActiveControl(null);
                  setIsErasing(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: '1px solid #3B82F6',
                  background: '#3B82F6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563EB';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3B82F6';
                  e.currentTarget.style.borderColor = '#3B82F6';
                }}
              >
                确认
              </button>
            </div>
          </motion.div>
        )}
        {activeControl === 'matting' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div 
              style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                background: '#fff',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <canvas
                ref={mattingCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              marginTop: '12px',
              padding: '0 12px'
            }}>
              <button
                onClick={() => {
                  setActiveControl(null);
                  setIsMatting(false);
                  onCancel();
                }}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                取消
              </button>
              {!hasChanges ? (
                <button
                  onClick={handleMatting}
                  style={{
                    flex: 1,
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: '1px solid #3B82F6',
                    background: '#3B82F6',
                    cursor: isProcessing ? 'wait' : 'pointer',
                    fontSize: '14px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                  disabled={isProcessing}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.background = '#2563EB';
                      e.currentTarget.style.borderColor = '#2563EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.background = '#3B82F6';
                      e.currentTarget.style.borderColor = '#3B82F6';
                    }
                  }}
                >
                  {isProcessing ? (
                    <>
                      <svg 
                        className="animate-spin" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2C6.47715 2 2 6.47715 2 12" />
                      </svg>
                      处理中...
                    </>
                  ) : '开始抠图'}
                </button>
              ) : (
                <button
                  onClick={applyMattingResult}
                  style={{
                    flex: 1,
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: '1px solid #10B981',
                    background: '#10B981',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.borderColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10B981';
                    e.currentTarget.style.borderColor = '#10B981';
                  }}
                >
                  应用
                </button>
              )}
            </div>
          </motion.div>
        )}
        {activeControl && activeControl !== 'erase' && activeControl !== 'matting' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '6px',
              padding: '16px 12px 24px', 
              marginTop: '1px',
              marginBottom: '5px',
              minHeight: '75px'
            }}
          >
            {activeControl === 'rotate' && (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  <span>旋转角度</span>
                  <span style={{ 
                    padding: '1px 4px',
                    background: '#fff',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}>
                    {Math.round(transform.rotate)}°
                  </span>
                </div>
                <div className={sliderStyles.sliderTrack}>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={transform.rotate}
                    onChange={handleRotateChange}
                    className={sliderStyles.slider}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            {activeControl === 'scale' && (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  <span>缩放比例</span>
                  <span style={{ 
                    padding: '1px 4px',
                    background: '#fff',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}>
                    {Math.round(transform.scale * 100)}%
                  </span>
                </div>
                <div className={sliderStyles.sliderTrack}>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={transform.scale}
                    onChange={handleScaleChange}
                    className={sliderStyles.slider}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全屏预览 */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            {/* 工具栏 */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                zIndex: 1001
              }}
            >
            </div>

            {/* 画布容器 */}
            <div className={styles.previewCanvasContainer}>
              <canvas
                ref={fullscreenCanvasRef}
                style={{
                  display: 'block',
                  touchAction: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              {/* 按钮组 */}
              <div
                className={styles.previewButtonGroup}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '10px',
                  zIndex: 1001
                }}
              >
                <div
                  className={styles.previewButtonWrapper}
                  onClick={handleEraseConfirm}
                >
                  <div
                    className={styles.previewButton}
                    title="完成"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    完成
                  </div>
                </div>
                <div
                  className={styles.previewButtonWrapper}
                  onClick={() => {
                    setIsFullscreen(false);
                    setIsErasing(false);
                    setActiveControl(null);
                    // 重置擦除画布
                    const canvas = eraseCanvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      const img = new Image();
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                      };
                      img.src = layer.src;
                    }
                  }}
                >
                  <div
                    className={styles.previewButton}
                    title="取消"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    取消
                  </div>
                </div>
              </div>
              {isFullscreen && isErasing && (
                <div 
                  className={styles.eraserPreview} 
                  style={{ 
                    left: `${eraserPosition.x}px`,
                    top: `${eraserPosition.y}px`
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageEditor;
