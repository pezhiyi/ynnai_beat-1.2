import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import EditModal from '../components/edit/EditModal';
import AIPortraitModal from '../components/AIPortraitModal';

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
  const [editMode, setEditMode] = useState(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAIPortraitModal, setShowAIPortraitModal] = useState(false);

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

  // 处理智能画像选择
  const handlePortraitStyleSelect = async (styleId) => {
    try {
      console.log('开始处理风格选择:', styleId);
      
      // 获取画布图片数据
      const imageBlob = await getCanvasImage();
      
      // 上传图片到服务端 API
      const imageUrl = await uploadToCOS(imageBlob, styleId);
      
      // 关闭模态框
      setShowAIPortraitModal(false);
      
      // 这里可以添加处理不同风格的逻辑
      console.log('选择的风格:', styleId);
      console.log('图片URL:', imageUrl);
      
      // 根据不同的风格ID执行相应的处理
      switch(styleId) {
        case 'pet-modern':
          // 处理现代宠物画像风格
          break;
        case 'pet-oil':
          // 处理宠物油画风格
          break;
        case 'human-cartoon':
          // 处理人物卡通风格
          break;
        case 'human-newmasus':
          // 处理人物Newmasus风格
          break;
        default:
          console.warn('未知的风格ID:', styleId);
      }
    } catch (error) {
      console.error('处理风格选择时出错:', error);
      // 这里可以添加错误处理UI提示
    }
  };

  // 处理图片下载
  const handleDownload = () => {
    // 先取消选中状态
    setSelectedLayer(null);
    
    // 延迟一帧执行下载，确保选中状态被清除
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // 创建临时链接并触发下载
      const link = document.createElement('a');
      link.download = 'canvas-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // 处理存档
  const handleArchive = useCallback(() => {
    console.log('存档仓库');
  }, []);

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
  const handleLayerSelect = (layerId, e) => {
    // 阻止事件冒泡
    e?.stopPropagation();
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
      let targetWidth, targetHeight, x, y;

      if (imageRatio === 1) {
        const size = Math.min(canvas.width, canvas.height);
        targetWidth = size / dpr;
        targetHeight = size / dpr;
        x = (canvas.width / dpr - targetWidth) / 2;
        y = (canvas.height / dpr - targetHeight) / 2;
      } else if (imageRatio > 1) {
        targetWidth = canvas.width / dpr;
        targetHeight = (canvas.width / dpr) / imageRatio;
        x = 0;
        y = (canvas.height / dpr - targetHeight) / 2;
      } else {
        targetHeight = canvas.height / dpr;
        targetWidth = (canvas.height / dpr) * imageRatio;
        x = (canvas.width / dpr - targetWidth) / 2;
        y = 0;
      }

      // 应用图层位置偏移
      const position = layerPositions[layer.id] || { x: 0, y: 0 };
      x += position.x;
      y += position.y;

      // 检查点击位置是否在图片范围内
      if (isPointInImage(x, y, {
        left: x,
        top: y,
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 获取点击的图层
    const clickedLayerId = getClickedLayer(x, y);
    
    if (clickedLayerId) {
      setIsDraggingImage(true);
      setDragStart({ x, y });
      // 设置选中的图层
      setSelectedLayer(clickedLayerId);
    } else {
      // 如果点击空白处，取消选中
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

  // 在图层状态变化时重新渲染
  useEffect(() => {
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
              ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
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
  }, [layers, canvasRef, layerPositions, selectedLayer]);

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
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
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

  // 处理画布鼠标移动
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
  const handleCanvasTouchMove = useCallback((e) => {
    if (!isDraggingImage || (!selectedLayer && !hasImage)) return;
    e.preventDefault();
    
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
  }, [isDraggingImage, selectedLayer, hasImage, layers, dragStart, moveLayer]);

  // 处理画布触摸结束
  const handleCanvasTouchEnd = () => {
    setIsDraggingImage(false);
  };

  // 处理画布鼠标离开
  const handleCanvasMouseLeave = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  // 处理画布鼠标进入
  const handleCanvasMouseEnter = useCallback(() => {
    // 如果需要在鼠标进入时执行任何操作，可以在这里添加
  }, []);

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

  // 处理画布区域外点击
  const handleOutsideClick = (e) => {
    // 如果点击的是画布或者图层面板内的元素,不处理
    if (e.target.closest('.draw-canvas') || 
        e.target.closest('.layers-panel') || 
        e.target.closest('.layers-mini')) {
      return;
    }
    // 取消选中状态
    setSelectedLayer(null);
  };

  useEffect(() => {
    // 添加点击事件监听
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // 处理返回按钮点击
  const handleBackEdit = () => {
    setEditMode(null);
  };

  const handleRotateChange = (angle) => {
    setCurrentAngle(angle);
    
    // 更新画布上的图层旋转
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 填充白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 重新绘制所有图层
    layers.forEach(layer => {
      if (!layer.visible) return;
      
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      };
      img.src = layer.src;
    });
  };

  const handleRotateComplete = (angle) => {
    setLayers(prevLayers => {
      const updatedLayers = [...prevLayers];
      if (updatedLayers.length > 0) {
        const layer = updatedLayers[0];
        const newAngle = ((layer.angle || 0) + angle) % 360; // 确保角度在 0-360 范围内
        updatedLayers[0] = { ...layer, angle: newAngle };
      }
      return updatedLayers;
    });
    setCurrentAngle(0);
  };

  // 处理关闭弹窗
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditMode(null);
  };

  // 处理编辑后的图片更新
  const handleImageUpdate = (editedImageData) => {
    setLayers(prev => {
      const updatedLayers = [...prev];
      const targetIndex = layers.length === 1 ? 0 : updatedLayers.findIndex(layer => layer.id === selectedLayer);
      
      if (targetIndex !== -1) {
        updatedLayers[targetIndex] = { 
          ...updatedLayers[targetIndex], 
          src: editedImageData 
        };
      }
      
      return updatedLayers;
    });
  };

  // 处理点击和触摸事件以打开AI肖像模态框
  const handleAIPortraitClick = () => {
    setShowAIPortraitModal(true);
  };

  // 处理移动端触摸事件
  const handleAIPortraitTouch = (e) => {
    e.preventDefault();
    handleAIPortraitClick();
  };

  // 获取画布图片数据
  const getCanvasImage = () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('开始获取画布数据...');
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('成功获取画布数据，大小：', blob.size);
            resolve(blob);
          } else {
            reject(new Error('无法获取画布图片数据'));
          }
        }, 'image/png');
      } catch (error) {
        console.error('获取画布数据失败:', error);
        reject(error);
      }
    });
  };

  // 上传图片到服务端 API
  const uploadToCOS = async (imageBlob, styleId) => {
    try {
      console.log('开始上传图片到服务器...');
      
      // 获取当前日期和时间
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds() + 2).padStart(2, '0');
      
      // 构建日期目录和文件名
      const dateDir = `${year}${month}${day}`;
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');
      formData.append('dateDir', dateDir);
      formData.append('timestamp', timestamp);
      formData.append('styleId', styleId);

      // 发送到服务端 API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('服务器返回错误:', errorData);
        throw new Error(errorData.details || '上传失败');
      }

      const data = await response.json();
      console.log('上传成功，文件URL:', data.url);
      return data.url;
    } catch (error) {
      console.error('上传过程出错:', error);
      throw error;
    }
  };

  // 新增功能按钮处理函数
  const handleAIPortrait = () => {
    setShowAIPortraitModal(true);
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

  // 新增编辑工具处理函数
  const handleMatting = () => {
    if (layers.length > 1 && !selectedLayer) {
      alert('请先选择要编辑的图层');
      return;
    }
    setEditMode('matting');
    setIsEditModalOpen(true);
  };

  const handleEnhance = () => {
    if (layers.length > 1 && !selectedLayer) {
      alert('请先选择要编辑的图层');
      return;
    }
    setEditMode('enhance');
    setIsEditModalOpen(true);
  };

  const handleZoom = () => {
    if (layers.length > 1 && !selectedLayer) {
      alert('请先选择要编辑的图层');
      return;
    }
    setEditMode('zoom');
    setIsEditModalOpen(true);
  };

  const handleRotate = () => {
    if (layers.length > 1 && !selectedLayer) {
      alert('请先选择要编辑的图层');
      return;
    }
    setEditMode('rotate');
    setIsEditModalOpen(true);
  };

  return (
    <Layout>
      <div 
        className="canvas-container"
        style={{
          width: '100%',
          height: `calc(100vh - 160px)`, /* 减去两个工具栏的高度：80px + 80px */
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflow: 'hidden'
        }}
      >
        <motion.div
          className={`canvas-wrapper ${isDragging ? 'dragging' : ''} ${hasImage ? 'has-image' : ''}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <canvas
            ref={canvasRef}
            className={`draw-canvas ${isDragging ? 'dragging' : ''}`}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onMouseEnter={handleCanvasMouseEnter}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            onTouchCancel={handleCanvasTouchEnd}
            style={{ 
              cursor: hasImage ? 'move' : 'default',
              position: 'relative'
            }}
          >
            {layers.map((layer, index) => (
              <div
                key={layer.id}
                className={`canvas-layer ${selectedLayer === layer.id ? 'selected' : ''}`}
                style={{
                  position: 'absolute',
                  left: layerPositions[layer.id]?.x || 0,
                  top: layerPositions[layer.id]?.y || 0,
                  display: layer.visible ? 'block' : 'none',
                  zIndex: layers.length - index,
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={layer.src}
                  alt={`图层 ${index + 1}`}
                  style={{
                    width: layer.width,
                    height: layer.height,
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              </div>
            ))}
          </canvas>
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
                    className={`layer-mini-item ${layer.visible ? 'visible' : ''} ${selectedLayer === layer.id ? 'selected' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={(e) => handleLayerSelect(layer.id, e)}
                  >
                    <img src={layer.src} alt={layer.name} className="layer-mini-preview" draggable={false} />
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
                <div className="layers-list">
                  {layers.map((layer, index) => (
                    <motion.div
                      key={layer.id}
                      className={`layer-item ${layer.visible ? 'visible' : ''} ${selectedLayer === layer.id ? 'selected' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div 
                        className={`layer-preview-container ${selectedLayer === layer.id ? 'selected' : ''}`}
                        onClick={(e) => handleLayerSelect(layer.id, e)}
                      >
                        <img 
                          src={layer.src} 
                          alt={`图层 ${index + 1}`}
                          className="layer-preview" 
                          draggable={false}
                        />
                        <span className="layer-index">{index + 1}</span>
                      </div>
                      
                      <div className="layer-controls">
                        <button
                          className={`layer-visibility ${layer.visible ? 'visible' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLayerVisibility(layer.id);
                          }}
                          title={layer.visible ? "隐藏图层" : "显示图层"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button
                          className="layer-move-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveUp(index);
                          }}
                          disabled={index === 0}
                          title="上移图层"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19V5M12 19H5M22 19h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                          </svg>
                        </button>
                        <button
                          className="layer-move-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveDown(index);
                          }}
                          disabled={index === layers.length - 1}
                          title="下移图层"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 7h10v10H7z"/>
                            <path d="M19 7v10H5V7"/>
                          </svg>
                        </button>
                        <button
                          className="layer-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLayer(layer.id);
                          }}
                          title="删除图层"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {layers.length < 5 && (
                  <div className="layers-footer">
                    <motion.button
                      className="layer-add-btn"
                      onClick={handleLayerUpload}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="添加图层"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </motion.button>
                  </div>
                )}
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
          {hasImage && (
            <motion.button
              className="canvas-archive"
              onClick={handleArchive}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              title="存档"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8v13H3L3 8" />
                <path d="M1 3h22v5H1z" />
                <path d="M10 12h4" />
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
            <div className={`tools-buttons ${editMode ? 'editing' : ''}`}>
              {!editMode ? (
                <>
                  <motion.button
                    className="tool-button matting"
                    onClick={handleMatting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <line x1="20" y1="4" x2="8.12" y2="15.88" />
                      <line x1="14.47" y1="14.48" x2="20" y2="20" />
                      <line x1="8.12" y1="8.12" x2="12" y2="12" />
                    </svg>
                    <span className="button-text">抠图</span>
                  </motion.button>

                  <motion.button
                    className="tool-button enhance"
                    onClick={handleEnhance}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                    </svg>
                    <span className="button-text">增强</span>
                  </motion.button>

                  <motion.button
                    className="tool-button erase"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 20H7L3 16c-.7-.7-.7-1.3 0-2l7-7c.7-.7 1.3-.7 2 0l5 5c.7.7.7 1.3 0 2l-7 7" />
                    </svg>
                    <span className="button-text">擦除</span>
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
                    <span className="button-text">旋转</span>
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
                    <span className="button-text">缩放</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    className="edit-controls"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {/* 移除所有编辑模式下的按钮 */}
                  </motion.div>
                </>
              )}
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
                  <path d="M21 8v13H3L3 8" />
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
                onClick={handleAIPortraitClick}
                onTouchStart={handleAIPortraitTouch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 6v12"/>
                  <path d="M6 12h12"/>
                </svg>
                智能画像
              </motion.button>
              
              <motion.button
                className="canvas-button style"
                onClick={handleStyleOverlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 8l-3-6H6L3 8v12h18V8z"/>
                  <path d="M3 8h18"/>
                  <path d="M15 8a3 3 0 0 0-6 0"/>
                </svg>
                商品选择
              </motion.button>
              
              <motion.button
                className="canvas-button order"
                onClick={handleOrder}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
                订单发货
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        layers={layers}
        selectedLayer={selectedLayer}
        dimensions={dimensions}
        canvasRef={canvasRef}
        onImageUpdate={handleImageUpdate}
        editMode={editMode}
      >
        {editMode === 'matting' && (
          <motion.button 
            className="tool-button" 
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 6v12"/>
              <path d="M6 12h12"/>
            </svg>
            <span className="button-text">抠图</span>
          </motion.button>
        )}
        
        {editMode === 'enhance' && (
          <motion.button 
            className="tool-button" 
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 4v2M12 18v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
            </svg>
            <span className="button-text">增强</span>
          </motion.button>
        )}
        
        {editMode === 'erase' && (
          <motion.button 
            className="tool-button" 
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16c-.7-.7-.7-1.3 0-2l7-7c.7-.7 1.3-.7 2 0l5 5c.7.7.7 1.3 0 2l-7 7" />
            </svg>
            <span className="button-text">擦除</span>
          </motion.button>
        )}
        
        {editMode === 'rotate' && (
          <motion.button 
            className="tool-button" 
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="button-text">旋转</span>
          </motion.button>
        )}
        
        {editMode === 'zoom' && (
          <motion.button 
            className="tool-button" 
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span className="button-text">缩放</span>
          </motion.button>
        )}
      </EditModal>

      {/* AI画像弹窗 */}
      <AIPortraitModal
        isOpen={showAIPortraitModal}
        onClose={() => setShowAIPortraitModal(false)}
        onSelect={handlePortraitStyleSelect}
      />
    </Layout>
  );
}