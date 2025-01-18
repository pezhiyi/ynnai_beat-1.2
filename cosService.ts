interface UploadParams {
  file: Blob;
  dateDir: string;
  timestamp: number;
  styleId: string;
}

interface UploadResult {
  url: string;
  fileName: string;
}

// COS 路径常量
const COS_PATHS = {
  UPLOAD: 'YnnAi_print',
  FEEDBACK: 'Feedback'
} as const;

// COS 配置
const COS_CONFIG = {
  BUCKET: process.env.NEXT_PUBLIC_COS_BUCKET,
  REGION: process.env.NEXT_PUBLIC_COS_REGION,
  BASE_URL: process.env.NEXT_PUBLIC_COS_BASE_URL
} as const;

/**
 * 上传文件到 COS
 * @param params 上传参数
 * @returns 上传结果，包含URL和文件名
 */
export const uploadToCOS = async (params: UploadParams): Promise<UploadResult> => {
  const { file, dateDir, timestamp, styleId } = params;
  const fileName = `${COS_PATHS.UPLOAD}/${dateDir}/YnnAI-${timestamp}_${styleId}.png`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('dateDir', dateDir);
  formData.append('timestamp', timestamp.toString());
  formData.append('styleId', styleId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};

/**
 * 从 COS 下载文件
 * @param url COS 文件 URL
 * @returns 下载的 Blob 对象
 */
export const downloadFromCOS = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Download failed');
  }
  return response.blob();
};

/**
 * 从 Canvas 获取图片数据
 * @returns 图片数据的 Blob 对象
 */
export const getCanvasImageData = async (): Promise<Blob> => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('No canvas found');
  }
  const imageUrl = canvas.toDataURL('image/png');
  return fetch(imageUrl).then(r => r.blob());
};

/**
 * 生成 COS 文件名
 * @param styleId 风格ID
 * @returns 文件名和相关信息
 */
export const generateCOSFileName = (styleId: string) => {
  const timestamp = Date.now();
  const dateDir = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `${COS_PATHS.UPLOAD}/${dateDir}/YnnAI-${timestamp}_${styleId}.png`;

  return {
    fileName,
    dateDir,
    timestamp,
  };
};

/**
 * 检查 COS 文件是否存在
 * @param path COS 文件路径
 * @returns 文件是否存在
 */
export const checkFileExists = async (path: string): Promise<boolean> => {
  try {
    console.log('[COS] 开始检查文件:', path);
    const response = await fetch(`/api/cos/headObject?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('[COS] 检查文件失败:', {
        status: response.status,
        statusText: response.statusText
      });
      return false;
    }

    const result = await response.json();
    console.log('[COS] 检查文件结果:', result);
    return result.exists;
  } catch (error) {
    console.error('[COS] 检查文件出错:', error);
    return false;
  }
};

/**
 * 获取 COS 文件的 URL
 * @param path COS 文件路径
 * @returns 完整的 COS URL
 */
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    console.log('[COS] 开始获取文件URL:', path);
    const response = await fetch(`/api/cos/download?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('[COS] 获取URL失败:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`获取URL失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[COS] 获取URL成功:', result);
    return result.url;
  } catch (error) {
    console.error('[COS] 获取URL出错:', error);
    // 如果获取失败，返回直接访问的 URL
    return `${COS_CONFIG.BASE_URL}/${path}`;
  }
};

/**
 * 下载并预览反馈图片
 * @param originalFileName 原始文件名
 * @param dateDir 日期目录
 * @returns 下载的图片 URL
 */
export const downloadFeedbackImage = async (originalFileName: string, dateDir: string): Promise<string> => {
  try {
    // 构建反馈文件名
    const feedbackFileName = originalFileName.replace('.png', '-feedback.png');
    const cosPath = `${COS_PATHS.FEEDBACK}/${dateDir}/${feedbackFileName}`;

    // 检查文件是否存在
    const exists = await checkFileExists(cosPath);
    if (!exists) {
      throw new Error('Feedback image not found');
    }

    // 下载文件
    const response = await fetch(`/api/cos/download?path=${encodeURIComponent(cosPath)}`);
    if (!response.ok) {
      throw new Error('Download failed');
    }

    // 创建本地预览 URL
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('下载反馈图片失败:', error);
    throw error;
  }
};

// 创建 cosService 对象
export const cosService = {
  uploadToCOS,
  downloadFromCOS,
  checkFileExists,
  downloadFeedbackImage,
  getCanvasImageData,
  generateCOSFileName,
  COS_PATHS,
  getFileUrl
};
