// 处理槽位下载任务的 Worker
let downloadInterval;
let startTime;
const DOWNLOAD_DURATION = 10 * 60 * 1000; // 10分钟
const CHECK_INTERVAL = 2000; // 2秒

// COS 路径常量
const COS_PATHS = {
  UPLOAD: 'YnnAi_print',
  FEEDBACK: 'Feedback'
};

self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  if (type === 'start') {
    const { slotId, fileName, dateDir } = data;
    console.log(`槽位${slotId}开始下载任务:`, fileName);
    
    startTime = Date.now();
    startDownloadCheck(slotId, fileName, dateDir);
  } else if (type === 'stop') {
    stopDownloadCheck();
  }
};

async function startDownloadCheck(slotId, fileName, dateDir) {
  // 从原始文件名中提取时间戳和风格ID
  const match = fileName.match(/YnnAI-(\d+)_(.+)\.png/);
  if (!match) {
    console.error(`槽位${slotId}文件名格式错误:`, fileName);
    self.postMessage({ type: 'error', slotId, error: '文件名格式错误' });
    return;
  }

  const [, timestamp, styleId] = match;
  // 构建反馈文件名（与上传格式一致）
  const feedbackFileName = `YnnAI-${timestamp}_${styleId}-feedback.png`;
  const cosPath = `${COS_PATHS.FEEDBACK}/${dateDir}/${feedbackFileName}`;
  
  console.log(`槽位${slotId}开始检查文件:`, cosPath);
  
  downloadInterval = setInterval(async () => {
    try {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      // 检查是否超过10分钟
      if (elapsedTime >= DOWNLOAD_DURATION) {
        console.log(`槽位${slotId}下载超时，恢复空槽位状态`);
        stopDownloadCheck();
        // 发送超时消息，包含重置槽位的数据
        self.postMessage({ 
          type: 'timeout', 
          slotId,
          data: {
            id: slotId,
            status: 'empty',
            isActive: false,
            lastModified: new Date().toISOString(),
            cosUrl: null,
            previewUrl: null,
            name: null
          }
        });
        return;
      }

      // 尝试下载文件
      const checkResponse = await fetch(`/api/cos/check?path=${encodeURIComponent(cosPath)}`);
      if (!checkResponse.ok) {
        throw new Error('检查文件失败');
      }
      
      const { exists } = await checkResponse.json();
      
      if (exists) {
        console.log(`槽位${slotId}文件已生成:`, cosPath);
        
        // 获取文件URL
        const urlResponse = await fetch(`/api/cos/download?path=${encodeURIComponent(cosPath)}`);
        if (!urlResponse.ok) {
          throw new Error(`获取URL失败: ${urlResponse.status} ${urlResponse.statusText}`);
        }
        
        const { url } = await urlResponse.json();
        console.log(`槽位${slotId}获取到URL:`, url);
        
        stopDownloadCheck();
        self.postMessage({ 
          type: 'success', 
          slotId,
          data: {
            cosUrl: cosPath,
            status: 'ready',
            lastModified: new Date().toISOString(),
            previewUrl: url,
            isActive: true
          }
        });
      } else {
        // 继续等待
        self.postMessage({ 
          type: 'checking', 
          slotId,
          progress: Math.floor((elapsedTime / DOWNLOAD_DURATION) * 100)
        });
      }
    } catch (error) {
      console.error(`槽位${slotId}检查出错:`, error);
      self.postMessage({ 
        type: 'error', 
        slotId, 
        error: error.message,
        data: {
          id: slotId,
          status: 'empty',
          isActive: false,
          lastModified: new Date().toISOString(),
          cosUrl: null,
          previewUrl: null,
          name: null
        }
      });
      stopDownloadCheck();
    }
  }, CHECK_INTERVAL);
}

function stopDownloadCheck() {
  if (downloadInterval) {
    clearInterval(downloadInterval);
    downloadInterval = null;
  }
}
