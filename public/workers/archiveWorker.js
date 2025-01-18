let archives = new Map();

self.onmessage = async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'SAVE':
        await handleSave(data);
        break;
      case 'LOAD':
        await handleLoad(data);
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
};

async function handleSave({ canvasData, layers, slotId }) {
  try {
    // 创建缩略图
    const thumbnail = await createThumbnail(canvasData);
    
    // 压缩和保存数据
    const archive = {
      canvasData,
      layers,
      timestamp: Date.now()
    };

    // 存储到 IndexedDB 或其他存储
    archives.set(slotId, archive);

    // 通知保存完成
    self.postMessage({
      type: 'SAVE_COMPLETE',
      data: {
        archive,
        thumbnail
      }
    });
  } catch (error) {
    throw new Error('保存失败: ' + error.message);
  }
}

async function handleLoad({ slotId }) {
  try {
    const archive = archives.get(slotId);
    if (!archive) {
      throw new Error('存档不存在');
    }

    self.postMessage({
      type: 'LOAD_COMPLETE',
      data: archive
    });
  } catch (error) {
    throw new Error('加载失败: ' + error.message);
  }
}

async function createThumbnail(canvasData) {
  // 创建缩略图的逻辑
  // 这里可以使用 OffscreenCanvas 来处理图像
  // 为了简单起见，这里直接返回原始数据
  return canvasData;
}
