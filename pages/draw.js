import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';

export default function Draw() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasImage, setHasImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [layers, setLayers] = useState([]);
  const [showLayers, setShowLayers] = useState(false);
  const layerInputRef = useRef(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerPositions, setLayerPositions] = useState({});
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageCache, setImageCache] = useState({});
  const offscreenCanvasRef = useRef(null);

  // 计算画布尺寸
  const calculateDimensions = () => {
    const padding = 16;
    const buttonAreaHeight = 80;
    const topOffset = 50;
    
    // 增加最大宽度
    const maxWidth = Math.min(window.innerWidth - (padding * 2), 800);
    
    // 根据3:4比例计算高度
    const aspectRatio = 3 / 4;
    const width = maxWidth;
    const height = width / aspectRatio;
    
    // 确保高度不超过可用空间
    const maxHeight = window.innerHeight - (padding * 2) - buttonAreaHeight - topOffset;
    
    // 如果计算的高度超过最大高度，则反向计算宽度
    if (height > maxHeight) {
      const adjustedHeight = maxHeight;
      const adjustedWidth = adjustedHeight * aspectRatio;
      setDimensions({ width: adjustedWidth, height: adjustedHeight });
    } else {
      setDimensions({ width, height });
    }
  };

  // 初始化和监听窗口大小变化
  useEffect(() => {
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // 初始化画布
  useEffect(() => {
    if (canvasRef.current && dimensions.width && dimensions.height) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // 获取设备像素比
      const dpr = window.devicePixelRatio || 1;
      
      // 设置画布的实际大小
      canvas.width = dimensions.width * dpr;
      canvas.height = dimensions.height * dpr;
      
      // 设置画布的显示大小
      canvas.style.width = `${dimensions.width}px`;
      canvas.style.height = `${dimensions.height}px`;
      
      // 根据设备像素比缩放上下文
      ctx.scale(dpr, dpr);
      
      // 设置渲染优化
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    }
  }, [dimensions]);

  // 处理拖拽事件
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 统一处理文件
  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // 保持3:4的画布比例
        const canvasRatio = 3/4;
        
        // 计算画布尺寸，基于图片尺寸
        let canvasWidth = dimensions.width * dpr;
        let canvasHeight = canvasWidth / canvasRatio;

        // 设置画布尺寸
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${canvasWidth / dpr}px`;
        canvas.style.height = `${canvasHeight / dpr}px`;

        // 清空画布并设置白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 设置渲染优化
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 计算图片缩放和位置
        const imageRatio = img.width / img.height;
        let targetWidth, targetHeight, x, y;

        if (imageRatio === 1) {
          // 正方形图片，居中显示
          const size = Math.min(canvasWidth, canvasHeight);
          targetWidth = size;
          targetHeight = size;
          x = (canvasWidth - size) / 2;
          y = (canvasHeight - size) / 2;
        } else if (imageRatio > 1) {
          // 横向图片，适应宽度
          targetWidth = canvasWidth;
          targetHeight = canvasWidth / imageRatio;
          x = 0;
          y = (canvasHeight - targetHeight) / 2;
        } else {
          // 纵向图片，适应高度
          targetHeight = canvasHeight;
          targetWidth = canvasHeight * imageRatio;
          x = (canvasWidth - targetWidth) / 2;
          y = 0;
        }
        
        // 绘制图片
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        
        setHasImage(true);

        // 添加为第一个图层
        const newLayer = {
          id: Date.now(),
          name: file.name,
          src: e.target?.result || '',
          visible: true,
          width: img.width,
          height: img.height
        };
        setLayers([newLayer]);
        setLayerPositions({
          [newLayer.id]: { x: 0, y: 0 }
        });
      };
      img.src = e.target?.result || '';
    };
    reader.readAsDataURL(file);
  };

  // 处理图片上传
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 新增功能按钮处理函数
  const handleAIPortrait = () => {
    console.log('智能画像');
  };

  const handleStyleOverlay = () => {
    console.log('风格叠加');
  };

  const handleProductSelect = () => {
    console.log('商品选择');
  };

  const handleOrder = () => {
    console.log('订单发货');
  };

  const handleArchive = () => {
    console.log('存档仓库');
  };

  // 处理图片下载
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // 创建临时画布以确保下载的图片包含所有图层和位置信息
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const canvas = canvasRef.current;
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // 复制当前画布内容到临时画布
    tempCtx.drawImage(canvas, 0, 0);
    
    // 创建临时链接并下载
    const link = document.createElement('a');
    link.download = `image-${new Date().getTime()}.png`;
    link.href = tempCanvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 新增编辑工具处理函数
  const handleMatting = () => {
    console.log('抠图');
  };

  const handleEnhance = () => {
    console.log('增强');
  };

  const handleErase = () => {
    console.log('擦除');
  };

  const handleRotate = () => {
    console.log('旋转');
  };

  const handleZoom = () => {
    console.log('缩放');
  };

  // 处理图层上传
  const handleLayerUpload = () => {
    layerInputRef.current?.click();
  };

  // 处理图层文件选择
  const handleLayerFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLayerFile(file);
    }
  };

  // 处理图层文件
  const handleLayerFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (layers.length >= 5) {
      alert('最多只能添加5个图层');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newLayer = {
          id: Date.now(),
          name: file.name,
          src: e.target?.result || '',
          visible: true,
          width: img.width,
          height: img.height
        };
        setLayers(prevLayers => [newLayer, ...prevLayers]);
        setLayerPositions(prev => ({
          ...prev,
          [newLayer.id]: { x: 0, y: 0 }
        }));
      };
      img.src = e.target?.result || '';
    };
    reader.readAsDataURL(file);
  };

  // 处理图层上移
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    setLayers(newLayers);
  };

  // 处理图层下移
  const handleMoveDown = (index) => {
    if (index === layers.length - 1) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    setLayers(newLayers);
  };

  // 处理图层可见性切换
  const handleLayerVisibility = (layerId) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  };

  // 处理图层选择
  const handleLayerSelect = (layerId) => {
    setSelectedLayer(layerId === selectedLayer ? null : layerId);
  };

  // 判断点击位置是否在图片内
  const isPointInImage = useCallback((x, y, imageInfo) => {
    const { left, top, width, height } = imageInfo;
    return x >= left && x <= left + width && y >= top && y <= top + height;
  }, []);

  // 获取点击位置的图层
  const getClickedLayer = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = window.devicePixelRatio || 1;
    // 从上到下遍历图层（从前到后）
    for (const layer of layers) {
      if (!layer.visible) continue;

      const img = new Image();
      img.src = layer.src;
      
      // 计算图片在画布中的实际位置和大小
      const imageRatio = img.width / img.height;
      let targetWidth, targetHeight, imgX, imgY;

      if (imageRatio === 1) {
        const size = Math.min(canvas.width, canvas.height);
        targetWidth = size / dpr;
        targetHeight = size / dpr;
        imgX = (canvas.width / dpr - targetWidth) / 2;
        imgY = (canvas.height / dpr - targetHeight) / 2;
      } else if (imageRatio > 1) {
        targetWidth = canvas.width / dpr;
        targetHeight = (canvas.width / dpr) / imageRatio;
        imgX = 0;
        imgY = (canvas.height / dpr - targetHeight) / 2;
      } else {
        targetHeight = canvas.height / dpr;
        targetWidth = (canvas.height / dpr) * imageRatio;
        imgX = (canvas.width / dpr - targetWidth) / 2;
        imgY = 0;
      }

      // 应用图层位置偏移
      const position = layerPositions[layer.id] || { x: 0, y: 0 };
      imgX += position.x;
      imgY += position.y;

      // 检查点击位置是否在图片范围内
      if (isPointInImage(x, y, {
        left: imgX,
        top: imgY,
        width: targetWidth,
        height: targetHeight
      })) {
        return layer.id;
      }
    }
    return null;
  }, [layers, layerPositions, isPointInImage]);

  // 处理画布鼠标按下
  const handleCanvasMouseDown = (e) => {
    if (!hasImage) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 获取点击的图层
    const clickedLayerId = getClickedLayer(x, y);
    if (clickedLayerId) {
      setSelectedLayer(clickedLayerId);
      setIsDraggingImage(true);
      setDragStart({ x, y });
    } else {
      setSelectedLayer(null);
    }
  };

  // 处理画布触摸开始
  const handleCanvasTouchStart = (e) => {
    if (!hasImage) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // 获取触摸的图层
    const clickedLayerId = getClickedLayer(x, y);
    if (clickedLayerId) {
      setSelectedLayer(clickedLayerId);
      setIsDraggingImage(true);
      setDragStart({ x, y });
    } else {
      setSelectedLayer(null);
    }
  };

  // 缓存图片
  const cacheImage = useCallback((layer) => {
    return new Promise((resolve) => {
      if (imageCache[layer.id]) {
        resolve(imageCache[layer.id]);
        return;
      }

      const img = new Image();
      img.onload = () => {
        setImageCache(prev => ({
          ...prev,
          [layer.id]: img
        }));
        resolve(img);
      };
      img.src = layer.src;
    });
  }, [imageCache]);

  // 创建离屏画布
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const offscreen = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      offscreen.width = dimensions.width * dpr;
      offscreen.height = dimensions.height * dpr;
      offscreenCanvasRef.current = offscreen;
    }
  }, [dimensions]);

  // 优化的渲染函数
  const renderLayers = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 按顺序渲染图层
    const renderLayerPromises = [...layers].reverse().map(layer => {
      if (!layer.visible) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const imageRatio = img.width / img.height;
            let targetWidth, targetHeight, x, y;

            if (imageRatio === 1) {
              const size = Math.min(canvas.width, canvas.height);
              targetWidth = size;
              targetHeight = size;
              x = (canvas.width - size) / 2;
              y = (canvas.height - size) / 2;
            } else if (imageRatio > 1) {
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

            // 应用图层位置偏移
            const position = layerPositions[layer.id] || { x: 0, y: 0 };
            
            ctx.save();
            
            // 使用 transform 优化变换操作
            ctx.translate(position.x * dpr, position.y * dpr);

            // 为选中的图层添加效果
            if (layer.id === selectedLayer) {
              ctx.shadowColor = 'rgba(124, 58, 237, 0.5)';
              ctx.shadowBlur = 10 * dpr;
            }

            ctx.drawImage(img, x, y, targetWidth, targetHeight);
            ctx.restore();
            resolve();
    } catch (error) {
            console.error('Error drawing layer:', error);
            reject(error);
          }
        };

        img.onerror = () => {
          console.error('Error loading image for layer:', layer.id);
          reject(new Error('Image load failed'));
        };

        img.src = layer.src;
      });
    });

    // 等待所有图层渲染完成
    Promise.all(renderLayerPromises).catch(error => {
      console.error('Error rendering layers:', error);
    });
  }, [layers, layerPositions, selectedLayer]);

  // 抽离图层绘制逻辑
  const drawLayer = (ctx, img, layer) => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = ctx.canvas;
    
    // 计算图片尺寸和位置
    const imageRatio = img.width / img.height;
    let targetWidth, targetHeight, x, y;

    if (imageRatio === 1) {
      const size = Math.min(canvas.width, canvas.height);
      targetWidth = size;
      targetHeight = size;
      x = (canvas.width - size) / 2;
      y = (canvas.height - size) / 2;
    } else if (imageRatio > 1) {
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

    // 应用图层位置偏移
    const position = layerPositions[layer.id] || { x: 0, y: 0 };
    
    ctx.save();
    
    // 使用 transform 优化变换操作
    const transform = new DOMMatrix()
      .translate(position.x * dpr, position.y * dpr);
    ctx.setTransform(transform);

    // 为选中的图层添加效果
    if (layer.id === selectedLayer) {
      ctx.shadowColor = 'rgba(124, 58, 237, 0.5)';
      ctx.shadowBlur = 10 * dpr;
    }

    ctx.drawImage(img, x, y, targetWidth, targetHeight);
    ctx.restore();
  };

  // 优化移动图层的函数
  const moveLayer = useCallback((layerId, deltaX, deltaY) => {
    const moveFrame = requestAnimationFrame(() => {
      setLayerPositions(prev => ({
        ...prev,
        [layerId]: {
          x: (prev[layerId]?.x || 0) + deltaX,
          y: (prev[layerId]?.y || 0) + deltaY
        }
      }));
    });
    return () => cancelAnimationFrame(moveFrame);
  }, []);

  // 优化的画布鼠标移动处理
  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDraggingImage || (!selectedLayer && !hasImage)) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = (x - dragStart.x) / (window.devicePixelRatio || 1);
    const deltaY = (y - dragStart.y) / (window.devicePixelRatio || 1);
    
    const layerId = selectedLayer || layers[0]?.id;
    if (layerId) {
      moveLayer(layerId, deltaX, deltaY);
    }
    
    setDragStart({ x, y });
  }, [isDraggingImage, selectedLayer, hasImage, layers, dragStart, moveLayer]);

  // 处理画布鼠标松开
  const handleCanvasMouseUp = () => {
    setIsDraggingImage(false);
  };

  // 在图层状态变化时重新渲染
  useEffect(() => {
    renderLayers();
  }, [layers, renderLayers]);

  // 处理触摸拖动开始
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    const item = e.currentTarget;
    const startY = touch.clientY;
    const startTop = item.offsetTop;
    
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaY = touch.clientY - startY;
      const newTop = startTop + deltaY;
      
      // 计算新的位置索引
      const itemHeight = item.offsetHeight;
      const newIndex = Math.round(newTop / itemHeight);
      const targetIndex = Math.max(0, Math.min(layers.length - 1, newIndex));
      
      if (targetIndex !== index) {
        handleLayerMove(index, targetIndex);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // 处理画布触摸移动
  const handleCanvasTouchMove = (e) => {
    if (!isDraggingImage || (!selectedLayer && !hasImage)) return;
    e.preventDefault(); // 防止页面滚动
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    const layerId = selectedLayer || layers[0]?.id;
    if (layerId) {
      moveLayer(layerId, deltaX, deltaY);
    }
    
    setDragStart({ x, y });
  };

  // 处理画布触摸结束
  const handleCanvasTouchEnd = () => {
    setIsDraggingImage(false);
  };

  // 创建图层预览图
  const createLayerThumbnail = useCallback((layer) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 40;
    canvas.height = 40;

    const img = new Image();
    img.onload = () => {
      const imageRatio = img.width / img.height;
      let targetWidth, targetHeight, x, y;

      if (imageRatio === 1) {
        targetWidth = targetHeight = 40;
        x = y = 0;
      } else if (imageRatio > 1) {
        targetWidth = 40;
        targetHeight = 40 / imageRatio;
        x = 0;
        y = (40 - targetHeight) / 2;
      } else {
        targetHeight = 40;
        targetWidth = 40 * imageRatio;
        x = (40 - targetWidth) / 2;
        y = 0;
      }

      ctx.drawImage(img, x, y, targetWidth, targetHeight);
    };
    img.src = layer.src;
    return canvas;
  }, []);

  // 添加点击外部关闭图层面板的处理函数
  const handleClickOutside = useCallback((e) => {
    if (showLayers && !e.target.closest('.layers-panel') && !e.target.closest('.canvas-layers')) {
      setShowLayers(false);
    }
  }, [showLayers]);

  // 添加点击外部关闭的事件监听
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // 处理图层删除
  const handleDeleteLayer = (layerId) => {
    setLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId));
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
  };

  return (
    <Layout>
      <div className="draw-container">
        <motion.div 
          className={`canvas-wrapper ${isDragging ? 'dragging' : ''}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <canvas
            ref={canvasRef}
            className={`draw-canvas ${isDraggingImage ? 'dragging' : ''}`}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            onTouchCancel={handleCanvasTouchEnd}
            style={{ cursor: hasImage ? 'move' : 'default' }}
          />
          <input
            type="file"
            ref={layerInputRef}
            onChange={handleLayerFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {/* 图层按钮 */}
          <div className="layers-container">
            <motion.button
              className="canvas-layers"
              onClick={() => setShowLayers(!showLayers)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              title="图层管理"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span className="layer-count">{layers.length}</span>
            </motion.button>

            {/* 最小化状态的图层列表 */}
            {!showLayers && layers.length > 0 && (
              <motion.div
                className="layers-mini"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {layers.map((layer, index) => (
                  <motion.div
                    key={layer.id}
                    className={`layer-mini-item ${layer.visible ? 'visible' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <img src={layer.src} alt={layer.name} className="layer-mini-preview" />
                    <span className="layer-mini-index">{index + 1}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* 展开状态的图层面板 */}
            {showLayers && (
              <motion.div
                className="layers-panel"
                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="layers-header">
                  <h3>图层管理</h3>
                  {layers.length < 5 && (
                    <motion.button
                      className="layer-add-btn"
                      onClick={handleLayerUpload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </motion.button>
                  )}
                </div>

                <div className="layers-list">
                  {layers.map((layer, index) => (
                    <motion.div
                      key={layer.id}
                      className={`layer-item ${layer.visible ? 'visible' : ''} ${selectedLayer === layer.id ? 'selected' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="layer-preview-container">
                        <img src={layer.src} alt={layer.name} className="layer-preview" />
                        <span className="layer-index">{index + 1}</span>
                      </div>
                      <div className="layer-controls">
                        <button
                          className={`layer-visibility ${layer.visible ? 'visible' : ''}`}
                          onClick={() => handleLayerVisibility(layer.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button
                          className="layer-move-btn"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19V5M5 12l7-7 7 7"/>
                          </svg>
                        </button>
                        <button
                          className="layer-move-btn"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === layers.length - 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                          </svg>
                        </button>
                        <button
                          className="layer-delete-btn"
                          onClick={() => handleDeleteLayer(layer.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
            </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {hasImage && (
            <motion.button
              className="canvas-download"
              onClick={handleDownload}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              title="下载图片"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </motion.button>
          )}
          {!hasImage && (
            <div className="upload-hint">
              <div className="hint-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3>点击或拖拽上传图片</h3>
              <p>支持 JPG、PNG、GIF 格式</p>
            </div>
          )}
        </motion.div>

        {hasImage && (
          <motion.div
            className="canvas-tools"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="tools-buttons">
              <motion.button
                className="tool-button matting"
                onClick={handleMatting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 4h10M7 20h10M4 7v10M20 7v10" />
                  <rect x="9" y="9" width="6" height="6" />
                </svg>
                抠图
              </motion.button>

              <motion.button
                className="tool-button enhance"
                onClick={handleEnhance}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 5v2M12 17v2M5 12H3M21 12h-2M18.36 18.36l-1.41-1.41M7.05 7.05L5.64 5.64M18.36 5.64l-1.41 1.41M7.05 16.95l-1.41 1.41" />
                </svg>
                增强
              </motion.button>

              <motion.button
                className="tool-button erase"
                onClick={handleErase}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 20H7L3 16l8-8 8 8-4 4" />
                </svg>
                擦除
              </motion.button>

              <motion.button
                className="tool-button rotate"
                onClick={handleRotate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                旋转
              </motion.button>

              <motion.button
                className="tool-button zoom"
                onClick={handleZoom}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                缩放
              </motion.button>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="canvas-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!hasImage ? (
            <div className="initial-buttons">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <motion.button
                className="canvas-button upload"
                onClick={handleUpload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                上传图片
              </motion.button>
              <motion.button
                className="canvas-button archive"
                onClick={handleArchive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
                存档仓库
              </motion.button>
            </div>
          ) : (
            <div className="function-buttons">
              <motion.button
                className="canvas-button smart-portrait"
                onClick={handleAIPortrait}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                  <path d="M12 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/>
                </svg>
                智能画像
              </motion.button>
              
              <motion.button
                className="canvas-button style"
                onClick={handleStyleOverlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2h20v20H2z"/>
                  <path d="M7 7h10v10H7z"/>
                </svg>
                风格叠加
              </motion.button>
              
              <motion.button
                className="canvas-button product"
                onClick={handleProductSelect}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8l-3-6H6L3 8v12h18V8z"/>
                  <path d="M3 8h18"/>
                  <path d="M15 8a3 3 0 0 1-6 0"/>
                </svg>
                商品选择
              </motion.button>
              
              <motion.button
                className="canvas-button order"
                onClick={handleOrder}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
                订单发货
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}