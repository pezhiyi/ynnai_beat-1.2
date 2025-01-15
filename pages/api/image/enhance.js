import COS from 'cos-nodejs-sdk-v5';

// 初始化 COS 实例
const cos = new COS({
  SecretId: process.env.TENCENT_CLOUD_SECRET_ID,
  SecretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '只支持 POST 请求' });
  }

  try {
    const { image_base64 } = req.body;

    if (!image_base64) {
      return res.status(400).json({ success: false, message: '缺少图片数据' });
    }

    // 将 base64 转换为 buffer
    const imageBuffer = Buffer.from(image_base64, 'base64');

    // 生成唯一的文件名
    const timestamp = Date.now();
    const objectKey = `enhance_${timestamp}.jpg`;
    const enhancedKey = `enhanced_${timestamp}.jpg`;

    // 上传图片并进行增强处理
    console.log('上传图片并进行增强处理...');
    const result = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: objectKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        Headers: {
          'Pic-Operations': JSON.stringify({
            is_pic_info: 1,
            rules: [{
              fileid: enhancedKey,
              rule: "ci-process=AIEnhanceImage"
            }]
          })
        }
      }, (err, data) => {
        if (err) {
          console.error('增强处理失败:', err);
          reject(err);
        } else {
          console.log('增强处理成功:', data);
          resolve(data);
        }
      });
    });

    // 等待一段时间确保处理完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 获取增强后的图片
    console.log('获取增强后的图片...');
    const enhancedImage = await new Promise((resolve, reject) => {
      cos.getObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: enhancedKey,
      }, (err, data) => {
        if (err) {
          console.error('获取增强后的图片失败:', err);
          reject(err);
        } else {
          console.log('获取增强后的图片成功');
          // 将二进制数据转换为base64
          const base64Data = Buffer.from(data.Body).toString('base64');
          resolve(base64Data);
        }
      });
    });

    // 清理临时文件
    console.log('清理临时文件...');
    await Promise.all([
      new Promise((resolve) => {
        cos.deleteObject({
          Bucket: 'ynnai-1256269009',
          Region: 'ap-guangzhou',
          Key: objectKey
        }, () => resolve());
      }),
      new Promise((resolve) => {
        cos.deleteObject({
          Bucket: 'ynnai-1256269009',
          Region: 'ap-guangzhou',
          Key: enhancedKey
        }, () => resolve());
      })
    ]);

    if (!enhancedImage) {
      throw new Error('增强后的图片数据为空');
    }

    // 返回增强后的图片
    return res.status(200).json({
      success: true,
      data: {
        enhanced_image: `data:image/jpeg;base64,${enhancedImage}`
      }
    });

  } catch (error) {
    console.error('增强处理出错:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '增强处理失败'
    });
  }
} 