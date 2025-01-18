import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: 'AKIDcDboqlTyGML7ua9kDVfeR5Yryu1xqfM4',
  SecretKey: '1rY4NVQAh2A4lEYijYAYs31lKjwwhEZk',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ message: 'Path is required' });
    }

    console.log('[COS Head] 检查文件:', path);

    const result = await new Promise((resolve, reject) => {
      cos.headObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: path,
      }, (err, data) => {
        if (err) {
          console.error('[COS Head] 检查失败:', err);
          // 如果是文件不存在的错误
          if (err.code === 'NoSuchKey') {
            resolve({ exists: false });
            return;
          }
          reject(err);
          return;
        }
        console.log('[COS Head] 检查成功:', data);
        resolve({ exists: true, data });
      });
    });

    if (!result.exists) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('[COS Head] 错误:', error);
    res.status(500).json({ message: '检查文件失败', error: error.message });
  }
}
