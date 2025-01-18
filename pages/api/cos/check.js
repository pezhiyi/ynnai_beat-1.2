// 导入真实服务
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

    console.log('[COS Check] 检查文件:', path);

    const exists = await new Promise((resolve) => {
      cos.headObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: path,
      }, (err) => {
        if (err) {
          console.log('[COS Check] 文件不存在:', err.code);
          resolve(false);
          return;
        }
        console.log('[COS Check] 文件存在');
        resolve(true);
      });
    });

    console.log('[COS Check] 检查结果:', exists);
    res.status(200).json({ exists });
  } catch (error) {
    console.error('[COS Check] 检查失败:', error);
    res.status(500).json({ message: '检查文件失败', error: error.message });
  }
}
