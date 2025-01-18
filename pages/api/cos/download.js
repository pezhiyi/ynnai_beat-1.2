// 导入真实服务
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.NEXT_PUBLIC_TENCENT_CLOUD_SECRET_ID,
  SecretKey: process.env.NEXT_PUBLIC_TENCENT_CLOUD_SECRET_KEY,
});

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
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

    console.log('Generating signed URL for:', path);

    const url = await new Promise((resolve, reject) => {
      cos.getObjectUrl({
        Bucket: process.env.NEXT_PUBLIC_COS_BUCKET,
        Region: process.env.NEXT_PUBLIC_COS_REGION,
        Key: path,
        Protocol: 'https',
        Expires: 7200,
        Sign: true,
      }, (err, data) => {
        if (err) {
          console.error('Failed to generate URL:', err);
          reject(err);
          return;
        }
        console.log('Generated URL:', data.Url);
        resolve(data.Url);
      });
    });

    // 设置缓存控制头
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // 返回签名后的 URL
    res.status(200).json({ 
      url,
      path,
      expires: new Date(Date.now() + 7200 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate signed URL',
      message: error.message,
      path: req.query.path
    });
  }
}
