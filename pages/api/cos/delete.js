/**
 * COS 文件删除 API
 * 
 * 安全警告：
 * 1. 此 API 执行不可恢复的删除操作
 * 2. 必须验证文件路径格式
 * 3. 仅允许删除 Feedback 目录下的文件
 * 
 * 请求格式：
 * DELETE /api/cos/delete?path=Feedback/YYYYMMDD/filename.png
 */

// 导入真实服务
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID || 'AKIDcDboqlTyGML7ua9kDVfeR5Yryu1xqfM4',
  SecretKey: process.env.COS_SECRET_KEY || '1rY4NVQAh2A4lEYijYAYs31lKjwwhEZk',
});

// 安全检查：验证文件路径
function validatePath(path) {
  // 检查是否是 Feedback 目录
  if (!path.startsWith('Feedback/')) {
    throw new Error('只能删除 Feedback 目录下的文件');
  }

  // 检查文件名格式
  const fileNamePattern = /^Feedback\/\d{8}\/YnnAI-\d+_[\w-]+-feedback\.png$/;
  if (!fileNamePattern.test(path)) {
    throw new Error('无效的文件路径格式');
  }

  return true;
}

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { path } = req.query;
    
    if (!path) {
      console.error('Missing path parameter');
      res.status(400).json({ error: 'Missing path parameter' });
      return;
    }

    // 执行安全检查
    try {
      validatePath(path);
    } catch (error) {
      console.error('Invalid path:', error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    console.log('Deleting file:', path);

    await new Promise((resolve, reject) => {
      cos.deleteObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: path,
      }, (err, data) => {
        if (err) {
          console.error('Failed to delete file:', err);
          reject(err);
          return;
        }
        console.log('File deleted successfully:', data);
        resolve(data);
      });
    });

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: '删除文件失败，请确保文件存在且有权限删除' });
  }
}
