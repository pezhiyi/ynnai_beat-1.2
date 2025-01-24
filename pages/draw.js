import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import AIPortraitModal from '../components/AIPortraitModal';
import ArchiveModal from '../components/ArchiveModal';
import ImageEditor from '../components/ImageEditor';
import SlotSelector from '../services/slotService/SlotSelector'; // 修正导入路径
import EditHint from '../components/EditHint'; // 导入EditHint组件

const CANVAS_RATIO = 3/4; // 画布比例 3:4

// 创建防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

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
  const [showAIPortraitModal, setShowAIPortraitModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showEditHint, setShowEditHint] = useState(false); // 添加编辑提示状态

  // 新增编辑模式相关状态
  const [editMode, setEditMode] = useState(false);
  const [editingLayer, setEditingLayer] = useState(null);
  const [layerTransforms, setLayerTransforms] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 新增编辑弹窗状态

  // 计算画布尺寸
  const calculateDimensions = () => {
    const padding = 16;
    const buttonAreaHeight = 80;
    const topOffset = 50;
    
    // 增加最大宽度
    const maxWidth = Math.min(window.innerWidth - (padding * 2), 800);
    
    // 根据3:4比例计算高度
    const width = maxWidth;
    const height = width / CANVAS_RATIO;
    
    // 确保高度不超过可用空间
    const maxHeight = window.innerHeight - (padding * 2) - buttonAreaHeight - topOffset;
    
    // 如果计算的高度超过最大高度，则反向计算宽度
    if (height > maxHeight) {
      const adjustedHeight = maxHeight;
      const adjustedWidth = adjustedHeight * CANVAS_RATIO;
      setDimensions({ width: adjustedWidth, height: adjustedHeight });
    } else {
      setDimensions({ width, height });
    }
  };

  // 初始化和监听窗口大小变化
  useEffect(() => {
    // 计算画布尺寸
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);

    // 初始化槽位选择器
    console.log('初始化槽位选择器');
    window.slotSelector = SlotSelector.getInstance();
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
    };
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

  // 处理画布点击事件
  const handleCanvasClick = () => {
    if (!hasImage) {
      fileInputRef.current?.click();
    }
  };

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
        const canvasRatio = CANVAS_RATIO;
        
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

        if (imageRatio > canvasRatio) {
          // 如果图片比例大于3:4，以宽度为基准
          targetWidth = canvasWidth;
          targetHeight = canvasWidth / imageRatio;
          x = 0;
          y = Math.max(0, (canvasHeight - targetHeight) / 2);
        } else {
          // 如果图片比例小于或等于3:4，以高度为基准
          targetHeight = canvasHeight;
          targetWidth = canvasHeight * imageRatio;
          x = Math.max(0, (canvasWidth - targetWidth) / 2);
          y = 0;
        }

        // 确保图片不会超出画布范围
        if (targetWidth > canvasWidth) {
          const scale = canvasWidth / targetWidth;
          targetWidth *= scale;
          targetHeight *= scale;
          x = 0;
          y = (canvasHeight - targetHeight) / 2;
        }
        if (targetHeight > canvasHeight) {
          const scale = canvasHeight / targetHeight;
          targetWidth *= scale;
          targetHeight *= scale;
          x = (canvasWidth - targetWidth) / 2;
          y = 0;
        }
        
        // 绘制图片
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        
        setHasImage(true);
        setShowEditHint(true); // 显示编辑提示

        const newLayer = {
          id: Date.now(),
          name: file.name,
          src: e.target?.result || '',
          visible: true,
          width: img.width,
          height: img.height,
          order: layers.length + 1 // 给新图层最高的order值
        };
        // 更新图层列表，新图层放在最前面
        setLayers(prevLayers => {
          // 不需要更新其他图层的order，因为在移动图层时会重新计算
          return [newLayer, ...prevLayers];
        });
        // 设置新图层位置
        setLayerPositions(prev => ({
          ...prev,
          [newLayer.id]: { x: 0, y: 0 }
        }));
        // 自动选中新图层
        setSelectedLayer(newLayer.id);
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
      
      // 确保 slotSelector 已初始化
      if (!window.slotSelector) {
        console.log('重新初始化槽位选择器');
        window.slotSelector = SlotSelector.getInstance();
      }
      
      // 获取画布图片数据
      console.log('获取画布图片数据...');
      const imageBlob = await getCanvasImage();
      console.log('画布图片数据大小:', imageBlob.size);
      
      // 生成时间戳和日期目录
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // 构建日期目录和时间戳
      const dateDir = `${year}${month}${day}`;
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      
      // 上传图片到服务端 API
      console.log('准备上传图片...');
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');
      formData.append('dateDir', dateDir);
      formData.append('timestamp', timestamp);
      formData.append('styleId', styleId);

      // 发送到服务端 API
      console.log('发送上传请求...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      console.log('上传成功，返回URL:', url);
      
      // 关闭模态框
      setShowAIPortraitModal(false);

      // 构造文件名
      const fileName = `YnnAI-${timestamp}_${styleId}.png`;
      console.log('生成的文件名:', fileName);
      
      // 将文件名传给图槽选择器并激活图槽
      if (window.slotSelector) {
        console.log('开始设置槽位...');
        console.log('传入的文件名:', fileName);
        const { slotId, slotData } = await window.slotSelector.setSlotNameAndActivate(fileName);
        console.log('槽位设置成功:');
        console.log('- 槽位ID:', slotId);
        console.log('- 槽位数据:', slotData);
        
        // 打开存档仓库显示进度
        console.log('打开存档仓库显示进度');
        setShowArchiveModal(true);
      } else {
        console.warn('未找到 slotSelector 实例');
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
    setShowArchiveModal(true);
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
          height: img.height,
          order: layers.length + 1 // 给新图层最高的order值
        };
        // 更新图层列表，新图层放在最前面
        setLayers(prevLayers => {
          // 不需要更新其他图层的order，因为在移动图层时会重新计算
          return [newLayer, ...prevLayers];
        });
        // 设置新图层位置
        setLayerPositions(prev => ({
          ...prev,
          [newLayer.id]: { x: 0, y: 0 }
        }));
        // 自动选中新图层
        setSelectedLayer(newLayer.id);
      };
      img.src = e.target?.result || '';
    };
    reader.readAsDataURL(file);
  };

  // 处理图层上移
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      // 直接交换相邻图层的位置
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      // 更新每个图层的order以匹配其新位置
      return newLayers.map((layer, idx) => ({
        ...layer,
        order: prevLayers.length - idx // 从上到下递减order
      }));
    });
  };

  // 处理图层下移
  const handleMoveDown = (index) => {
    if (index === layers.length - 1) return;
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      // 直接交换相邻图层的位置
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      // 更新每个图层的order以匹配其新位置
      return newLayers.map((layer, idx) => ({
        ...layer,
        order: prevLayers.length - idx // 从上到下递减order
      }));
    });
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
    e?.stopPropagation();
    
    // 如果在编辑模式且选中的不是当前编辑的图层，不允许切换
    if (editMode && layerId !== editingLayer) {
      return;
    }
    
    // 如果点击的是当前选中的图层，并且不在编辑模式，则取消选中
    if (layerId === selectedLayer && !editMode) {
      setSelectedLayer(null);
      return;
    }
    
    // 选中新图层
    setSelectedLayer(layerId);
    
    // 如果该图层不可见，则设为可见
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: true }
          : layer
      )
    );
  };

  // 进入编辑模式
  const handleEditLayer = useCallback((layerId) => {
    // 如果图层面板打开，不进入编辑模式
    if (showLayers) return;

    setEditMode(true);
    setEditingLayer(layerId);
    setSelectedLayer(layerId);
    
    // 获取当前变换值
    const currentTransform = layerTransforms[layerId] || {
      rotation: 0,
      scale: 1,
      translateX: 0,
      translateY: 0
    };
    
    // 更新变换值，保持当前状态
    setLayerTransforms(prev => ({
      ...prev,
      [layerId]: {
        ...currentTransform,
        previousState: { ...currentTransform } // 保存编辑前的状态，用于取消编辑
      }
    }));

    // 关闭图层面板，打开编辑弹窗
    setShowLayers(false);
    setIsEditModalOpen(true);
  }, [showLayers, layerTransforms]);

  // 退出编辑模式
  const handleEditComplete = (save = true) => {
    if (!editMode || !editingLayer) return;
    
    if (save) {
      // 保存当前变换状态
      const currentTransform = layerTransforms[editingLayer];
      setLayerTransforms(prev => ({
        ...prev,
        [editingLayer]: {
          rotation: currentTransform.rotation,
          scale: currentTransform.scale,
          translateX: layerPositions[editingLayer]?.x || 0,
          translateY: layerPositions[editingLayer]?.y || 0
        }
      }));

      // 关闭弹窗
      setIsEditModalOpen(false);
      setEditMode(false);
      setEditingLayer(null);
      return;
    }

    // 取消编辑，恢复之前的状态
    const previousState = layerTransforms[editingLayer]?.previousState;
    if (previousState) {
      setLayerTransforms(prev => ({
        ...prev,
        [editingLayer]: { ...previousState }
      }));
      setLayerPositions(prev => ({
        ...prev,
        [editingLayer]: {
          x: previousState.translateX,
          y: previousState.translateY
        }
      }));
    }

    setEditMode(false);
    setEditingLayer(null);
    setIsEditModalOpen(false);
  };

  // 处理旋转变化
  const handleRotationChange = (rotation) => {
    if (!editingLayer) return;
    setLayerTransforms(prev => ({
      ...prev,
      [editingLayer]: {
        ...prev[editingLayer],
        rotation
      }
    }));
  };

  // 处理缩放变化
  const handleScaleChange = (scale) => {
    if (!editingLayer) return;
    setLayerTransforms(prev => ({
      ...prev,
      [editingLayer]: {
        ...prev[editingLayer],
        scale
      }
    }));
  };

  // 处理变换更新
  const handleTransformChange = ({ type, value }) => {
    if (!editingLayer) return;

    if (type === 'erase' || type === 'matting') {
      return; // 不再直接更新，等待确认
    }

    // 处理其他变换类型...
    switch (type) {
      case 'rotate':
        setLayerTransforms(prev => ({
          ...prev,
          [editingLayer]: {
            ...prev[editingLayer],
            rotation: value
          }
        }));
        break;
      
      case 'scale':
        setLayerTransforms(prev => ({
          ...prev,
          [editingLayer]: {
            ...prev[editingLayer],
            scale: value
          }
        }));
        break;
      
      case 'translate':
        setLayerPositions(prev => ({
          ...prev,
          [editingLayer]: {
            x: value.x,
            y: value.y
          }
        }));
        break;
      
      case 'reset':
        setLayerTransforms(prev => ({
          ...prev,
          [editingLayer]: {
            rotation: 0,
            scale: 1
          }
        }));
        setLayerPositions(prev => ({
          ...prev,
          [editingLayer]: {
            x: 0,
            y: 0
          }
        }));
        break;
    }
  };

  // 确认编辑
  const handleConfirmEdit = (transform) => {
    if (!editingLayer) return;

    if (transform?.type === 'erase' || transform?.type === 'matting') {
      // 更新图层的图像数据并立即重新渲染画布
      setLayers(prevLayers => {
        const newLayers = prevLayers.map(layer =>
          layer.id === editingLayer
            ? { ...layer, src: transform.value }
            : layer
        );
        // 在状态更新完成后立即重新渲染
        requestAnimationFrame(() => {
          updateCanvas();
        });
        return newLayers;
      });

      // 关闭弹窗
      setIsEditModalOpen(false);
      return;
    }

    // 更新其他变换
    if (transform?.rotate !== undefined) {
      setLayerTransforms(prev => ({
        ...prev,
        [editingLayer]: {
          ...prev[editingLayer],
          rotation: transform.rotate,
          scale: transform.scale || 1
        }
      }));
    }

    if (transform?.translateX !== undefined && transform?.translateY !== undefined) {
      setLayerPositions(prev => ({
        ...prev,
        [editingLayer]: {
          x: transform.translateX,
          y: transform.translateY
        }
      }));
    }

    // 关闭弹窗
    setIsEditModalOpen(false);
  };

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    // 恢复原始变换值
    if (editingLayer) {
      const originalTransform = layerTransforms[editingLayer] || { rotation: 0, scale: 1 };
      const originalPosition = layerPositions[editingLayer] || { x: 0, y: 0 };

      setLayerTransforms(prev => ({
        ...prev,
        [editingLayer]: originalTransform
      }));

      setLayerPositions(prev => ({
        ...prev,
        [editingLayer]: originalPosition
      }));
    }

    // 退出编辑模式
    setEditMode(false);
    setEditingLayer(null);
    setIsEditModalOpen(false); // 关闭编辑弹窗
    // 退出编辑模式后再显示图层面板
    setShowLayers(true);
  }, [editingLayer, layerTransforms, layerPositions]);

  // 处理图层按钮点击
  const handleLayersButtonClick = useCallback((e) => {
    e.stopPropagation(); // 阻止事件冒泡
    // 如果在编辑模式，先退出编辑模式
    if (editMode) {
      handleCancelEdit();
    }
    // 切换图层面板显示状态
    setShowLayers(prev => !prev);
  }, [editMode, handleCancelEdit]);

  // 创建防抖的updateCanvas函数
  const debouncedUpdateCanvas = useCallback(
    debounce(() => {
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 填充白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 按图层顺序绘制（从下到上）
        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

        // 遍历并绘制每个图层
        sortedLayers.forEach(layer => {
          if (!layer.visible) return;

          let img = imageCache[layer.id];
          if (!img) {
            // 如果图片不在缓存中，创建并加载
            img = new Image();
            img.src = layer.src;
            img.onload = () => {
              setImageCache(prev => ({
                ...prev,
                [layer.id]: img
              }));
            };
            return;
          }

          ctx.save();

          const imageRatio = layer.width / layer.height;
          let targetWidth, targetHeight, x, y;

          // 计算图层尺寸和位置
          if (imageRatio > CANVAS_RATIO) {
            targetWidth = canvas.width;
            targetHeight = canvas.width / imageRatio;
            x = 0;
            y = Math.max(0, (canvas.height - targetHeight) / 2);
          } else {
            targetHeight = canvas.height;
            targetWidth = canvas.height * imageRatio;
            x = Math.max(0, (canvas.width - targetWidth) / 2);
            y = 0;
          }

          // 应用图层变换
          const transform = layerTransforms[layer.id] || { rotation: 0, scale: 1 };
          const position = layerPositions[layer.id] || { x: 0, y: 0 };

          // 移动到图层中心点
          ctx.translate(
            x + targetWidth / 2 + position.x * dpr,
            y + targetHeight / 2 + position.y * dpr
          );

          // 应用旋转和缩放
          ctx.rotate(transform.rotation * Math.PI / 180);
          ctx.scale(transform.scale, transform.scale);

          // 绘制图层
          ctx.drawImage(
            img,
            -targetWidth / 2,
            -targetHeight / 2,
            targetWidth,
            targetHeight
          );

          // 如果是选中的图层，绘制选中效果
          if (layer.id === selectedLayer) {
            // 保存当前图层的数据
            const layerData = {
              x: x + position.x * dpr,
              y: y + position.y * dpr,
              width: targetWidth,
              height: targetHeight,
              transform: transform,
              imageData: ctx.getImageData(
                x + position.x * dpr,
                y + position.y * dpr,
                targetWidth,
                targetHeight
              )
            };

            // 绘制选中框
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // 使用半透明的蓝色
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]); // 设置虚线样式
            ctx.lineDashOffset = Date.now() / 100; // 添加动画效果
            
            // 绘制边框，与图片大小完全贴合
            ctx.strokeRect(
              -targetWidth / 2,
              -targetHeight / 2,
              targetWidth,
              targetHeight
            );
            
            // 绘制四个角的小圆点
            ctx.fillStyle = '#3B82F6'; // 蓝色
            ctx.setLineDash([]); // 取消虚线
            const cornerRadius = 3; // 稍微减小圆点大小
            const corners = [
              [-targetWidth / 2, -targetHeight / 2], // 左上
              [targetWidth / 2, -targetHeight / 2],  // 右上
              [-targetWidth / 2, targetHeight / 2],  // 左下
              [targetWidth / 2, targetHeight / 2]    // 右下
            ];
            corners.forEach(([x, y]) => {
              ctx.beginPath();
              ctx.arc(x, y, cornerRadius, 0, Math.PI * 2);
              ctx.fill();
            });

            // 将图层数据存储起来，供其他函数使用
            window.selectedLayerData = layerData;
          }

          ctx.restore();
        });
      });
    }, 16) // 16ms 约等于 60fps
  , [layers, layerTransforms, layerPositions, selectedLayer, imageCache]);

  // 替换原有的 updateCanvas
  const updateCanvas = useCallback(() => {
    debouncedUpdateCanvas();
  }, [debouncedUpdateCanvas]);

  // 当图层状态改变时更新画布
  useEffect(() => {
    updateCanvas();
  }, [layers, layerTransforms, layerPositions, updateCanvas]);

  // 获取点击的图层
  const getClickedLayer = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // 按顺序检查每个图层（从上到下）
    const sortedLayers = [...layers].sort((a, b) => b.order - a.order);
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      const imageRatio = layer.width / layer.height;
      let targetWidth, targetHeight, layerX, layerY;
      const dpr = window.devicePixelRatio || 1;

      if (imageRatio > CANVAS_RATIO) {
        targetWidth = canvas.width;
        targetHeight = canvas.width / imageRatio;
        layerX = 0;
        layerY = Math.max(0, (canvas.height - targetHeight) / 2);
      } else {
        targetHeight = canvas.height;
        targetWidth = canvas.height * imageRatio;
        layerX = Math.max(0, (canvas.width - targetWidth) / 2);
        layerY = 0;
      }

      // 应用图层变换
      const transform = layerTransforms[layer.id] || { rotation: 0, scale: 1 };
      const position = layerPositions[layer.id] || { x: 0, y: 0 };

      // 修正坐标系转换
      const centerX = layerX + targetWidth / 2 + position.x;
      const centerY = layerY + targetHeight / 2 + position.y;
      
      // 计算点击位置相对于图层中心的偏移
      const relativeX = (x * dpr - centerX);
      const relativeY = (y * dpr - centerY);
      
      // 应用缩放和旋转变换
      const adjustedX = relativeX / transform.scale + targetWidth / 2;
      const adjustedY = relativeY / transform.scale + targetHeight / 2;

      // 检查点击是否在图层范围内
      if (
        adjustedX >= 0 &&
        adjustedX <= targetWidth &&
        adjustedY >= 0 &&
        adjustedY <= targetHeight
      ) {
        return layer.id;
      }
    }
    return null;
  }, [layers, layerTransforms, layerPositions, CANVAS_RATIO]);

  // 处理画布鼠标按下
  const [moveDistance, setMoveDistance] = useState(0);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const moveThreshold = 5; // 移动阈值，超过这个距离视为拖动

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 获取点击的图层
    const clickedLayerId = getClickedLayer(x, y);
    
    // 如果图层面板打开，只允许拖动，不进入编辑模式
    if (clickedLayerId) {
      setSelectedLayer(clickedLayerId);
      // 只有在图层面板关闭时才设置拖动状态
      if (!showLayers) {
        setIsDraggingImage(true);
        setDragStart({ x, y });
        setInitialPosition({ x, y });
        setMoveDistance(0);
      }
    } else {
      setSelectedLayer(null);
      if (editMode) {
        handleCancelEdit();
      }
    }
  };

  // 处理画布鼠标移动
  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDraggingImage || !selectedLayer) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // 计算移动距离
    const dx = x - initialPosition.x;
    const dy = y - initialPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    setMoveDistance(distance);

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    setLayerPositions(prev => ({
      ...prev,
      [selectedLayer]: {
        x: (prev[selectedLayer]?.x || 0) + deltaX,
        y: (prev[selectedLayer]?.y || 0) + deltaY
      }
    }));
    
    setDragStart({ x, y });
  }, [isDraggingImage, selectedLayer, dragStart, initialPosition]);

  // 处理画布鼠标松开
  const handleCanvasMouseUp = () => {
    if (isDraggingImage && selectedLayer && moveDistance < moveThreshold) {
      // 如果移动距离小于阈值且在图片范围内，视为点击，进入编辑模式
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = dragStart.x - rect.left;
        const mouseY = dragStart.y - rect.top;
        const clickedLayerId = getClickedLayer(mouseX, mouseY);
        
        // 只有当点击位置在图片范围内时才进入编辑模式
        if (clickedLayerId === selectedLayer && !showLayers) {
          handleEditLayer(selectedLayer);
        }
      }
    }
    setIsDraggingImage(false);
    setMoveDistance(0);
  };

  // 处理画布触摸开始
  const handleCanvasTouchStart = useCallback((e) => {
    if (!hasImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 防止页面滚动和其他默认行为
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // 获取触摸的图层
    const clickedLayerId = getClickedLayer(x, y);
    if (clickedLayerId) {
      e.stopPropagation(); // 确保事件不会冒泡到其他元素
      setSelectedLayer(clickedLayerId);
      setIsDraggingImage(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setInitialPosition({ x: touch.clientX, y: touch.clientY });
      setMoveDistance(0);
    } else {
      // 如果点击空白区域且在编辑模式，退出编辑模式
      if (editMode) {
        handleCancelEdit();
      }
      setSelectedLayer(null);
    }
  }, [hasImage, editMode, getClickedLayer, handleCancelEdit]);

  // 处理画布触摸移动
  const handleCanvasTouchMove = useCallback((e) => {
    if (!isDraggingImage || !selectedLayer) return;
    
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    
    // 使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      // 计算移动距离用于判断是否为点击
      const dx = touch.clientX - initialPosition.x;
      const dy = touch.clientY - initialPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setMoveDistance(distance);

      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      setLayerPositions(prev => {
        const currentPos = prev[selectedLayer] || { x: 0, y: 0 };
        
        // 计算新位置
        const newX = currentPos.x + deltaX;
        const newY = currentPos.y + deltaY;
        
        // 限制移动范围，防止图层移动过远
        const canvas = canvasRef.current;
        if (!canvas) return prev;
        
        const maxDistance = Math.max(canvas.width, canvas.height) * 0.5; // 最大移动距离为画布尺寸的一半
        
        return {
          ...prev,
          [selectedLayer]: {
            x: Math.max(Math.min(newX, maxDistance), -maxDistance),
            y: Math.max(Math.min(newY, maxDistance), -maxDistance)
          }
        };
      });
      
      setDragStart({ x: touch.clientX, y: touch.clientY });
    });
  }, [isDraggingImage, selectedLayer, dragStart, initialPosition]);

  // 处理画布触摸结束
  const handleCanvasTouchEnd = useCallback((e) => {
    if (!selectedLayer) return;

    e.stopPropagation();
    e.preventDefault();

    if (moveDistance < moveThreshold) {
      // 获取触摸结束时的位置
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        const clickedLayerId = getClickedLayer(touchX, touchY);
        
        // 只有当触摸结束位置在图片范围内时才进入编辑模式
        if (clickedLayerId === selectedLayer && !showLayers) {
          handleEditLayer(selectedLayer);
        }
      }
    }
    
    setIsDraggingImage(false);
    setMoveDistance(0);
    setDragStart({ x: 0, y: 0 });
  }, [selectedLayer, moveDistance, moveThreshold, showLayers, handleEditLayer, getClickedLayer]);

  // 移除旧的重复函数
  const moveLayer = useCallback((deltaX, deltaY) => {
    if (selectedLayer !== null) {
      setLayerPositions(prev => ({
        ...prev,
        [selectedLayer]: {
          x: (prev[selectedLayer]?.x || 0) + deltaX,
          y: (prev[selectedLayer]?.y || 0) + deltaY
        }
      }));
    }
  }, [selectedLayer]);

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

  // 判断点击位置是否在图片内
  const isPointInImage = useCallback((x, y, imageInfo) => {
    const { left, top, width, height } = imageInfo;
    return x >= left && x <= left + width && y >= top && y <= top + height;
  }, []);

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
    // 移除编辑模式相关状态
  };

  // 处理关闭弹窗
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false); // 关闭编辑弹窗
  };

  // 处理编辑后的图片更新
  const handleImageUpdate = (editedImageData) => {
    // 移除编辑模式相关状态
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
      console.log('发送上传请求...');
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
      return { url: data.url, fileName: data.fileName };
    } catch (error) {
      console.error('上传过程出错:', error);
      throw error;
    }
  };

  // 处理编辑按钮点击
  const handleEditClick = (mode) => {
    // 移除编辑模式相关状态
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
    // 移除编辑模式相关状态
  };

  const handleEnhance = () => {
    // 移除编辑模式相关状态
  };

  const handleZoom = () => {
    // 移除编辑模式相关状态
  };

  const handleRotate = () => {
    // 移除编辑模式相关状态
  };

  useEffect(() => {
    if (hasImage) {
      setTimeout(() => setShowButtons(true), 300);
    } else {
      setShowButtons(false);
    }
  }, [hasImage]);

  // 下载画布内容
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取当前时间并格式化
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `YnnAI-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Layout>
      <div 
        className="canvas-container"
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="canvas-wrapper">
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
            onClick={handleCanvasClick}
            style={{ 
              cursor: hasImage ? 'move' : 'pointer',
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
                  className="layer-preview" 
                  draggable={false}
                />
              </div>
            ))}
          </canvas>
          
          {!hasImage && (
            <>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50.5%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.2rem',
                color: 'rgba(0, 0, 0, 0.5)',
                userSelect: 'none',
                pointerEvents: 'none',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '50%',
                  marginBottom: '0.5rem'
                }}>
                  <svg 
                    width="42" 
                    height="42" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  点击上传图片
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(0, 0, 0, 0.3)',
                }}>
                  支持拖拽上传
                </div>
              </div>
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none'
              }}>
                <img 
                  src="/images/logo_all.png" 
                  alt="示例图片"
                  style={{
                    width: '86px',
                    height: '29px',
                    objectFit: 'contain',
                    borderRadius: '0px',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFile(file);
              }
            }}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={layerInputRef}
            onChange={handleLayerFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {/* 在画布容器内添加EditHint */}
          {showEditHint && hasImage && (
            <EditHint 
              onHintClick={() => {
                setShowEditHint(false);
                if (selectedLayer) {
                  setEditMode(true);
                  setEditingLayer(selectedLayer);
                  setIsEditModalOpen(true);
                }
              }}
            />
          )}
          {/* 图层按钮 */}
          {hasImage && (
            <motion.button
              className="tool-button"
              onClick={handleLayersButtonClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="图层管理"
              style={{
                position: 'absolute',
                top: '1.2rem',
                left: '1.2rem',
                zIndex: 50,
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1a1a',
                transition: 'all 0.2s ease'
              }}
            >
              <svg className="button-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
                <circle cx="2" cy="6" r="1" fill="currentColor"/>
                <circle cx="2" cy="12" r="1" fill="currentColor"/>
                <circle cx="2" cy="18" r="1" fill="currentColor"/>
              </svg>
            </motion.button>
          )}
          {/* 图层面板 */}
          {hasImage && showLayers && (
            <motion.div
              className="layers-panel"
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: '3.5rem',
                left: '1.2rem',
                zIndex: 49
              }}
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
                          <path d="M2 12s4-5 10-5 10 5 10 5-4 5-10 5-10-5-10-5z" strokeLinecap="round"/>
                          <circle cx="12" cy="12" r="3" strokeLinecap="round"/>
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
                          <path d="M17 8l-5-5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 16V4" strokeLinecap="round"/>
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
                          <path d="M17 16l-5 5-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8v12" strokeLinecap="round"/>
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
                          <path d="M18 6L6 18" strokeLinecap="round"/>
                          <path d="M6 12h12" strokeLinecap="round"/>
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
                      <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                      <path d="M12 8v8" strokeLinecap="round"/>
                      <path d="M8 12h8" strokeLinecap="round"/>
                    </svg>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
          {isClient && hasImage && (
            <motion.button
              onClick={handleDownloadCanvas}
              className="tool-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="下载画布"
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                zIndex: 50,
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1a1a',
                transition: 'all 0.2s ease'
              }}
            >
              <svg className="button-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4"/>
                <path d="M17 9l-5 5-5-5"/>
                <path d="M12 14V3"/>
              </svg>
            </motion.button>
          )}
          
          <motion.div 
            className={`canvas-buttons ${showButtons ? 'visible' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hasImage && (
              <motion.button
                className="archive-button"
                onClick={handleArchive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="存档仓库"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8v13H3L3 8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
              </motion.button>
            )}

            {!hasImage ? (
              <div className="initial-buttons">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFile(file);
                    }
                  }}
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <AIPortraitModal
          isOpen={showAIPortraitModal}
          onClose={() => setShowAIPortraitModal(false)}
          onSelect={handlePortraitStyleSelect}
        />

        <ArchiveModal
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
        />

        <AnimatePresence>
          {editMode && editingLayer && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ImageEditor
                layer={layers.find(l => l.id === editingLayer)}
                onTransformChange={handleTransformChange}
                onConfirm={handleConfirmEdit}
                onCancel={handleCancelEdit}
                onRotationChange={handleRotationChange}
                onScaleChange={handleScaleChange}
                initialTransform={{
                  rotate: layerTransforms[editingLayer]?.rotation || 0,
                  scale: layerTransforms[editingLayer]?.scale || 1,
                  translateX: layerPositions[editingLayer]?.x || 0,
                  translateY: layerPositions[editingLayer]?.y || 0
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            className="edit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelEdit();
              }
            }}
          />
        )}
      </div>
    </Layout>
  );
}