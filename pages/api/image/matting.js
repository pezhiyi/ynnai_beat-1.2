import COS from 'cos-nodejs-sdk-v5';
import Logger from '@/utils/api/logger';

// 初始化 COS 实例
const cos = new COS({
  SecretId: process.env.NEXT_PUBLIC_TENCENT_CLOUD_SECRET_ID,
  SecretKey: process.env.NEXT_PUBLIC_TENCENT_CLOUD_SECRET_KEY
});

// 添加一个验证函数检查图片是否成功上传
async function verifyUpload(params) {
  const logger = Logger.forRequest();
  
  return new Promise((resolve, reject) => {
    cos.headObject({
      Bucket: params.Bucket,
      Region: params.Region,
      Key: params.Key
    }, (err, data) => {
      if (err) {
        logger.error('验证上传失败', {
          error: err,
          params: params
        });
        reject(err);
        return;
      }
      
      logger.info('验证上传成功', {
        key: params.Key,
        contentLength: data.headers['content-length'],
        contentType: data.headers['content-type']
      });
      
      resolve(data);
    });
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb'
    }
  }
};

export default async function handler(req, res) {
  const logger = Logger.forRequest();
  
  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { image_base64 } = req.body;
    
    if (!image_base64) {
      throw new Error('Missing image data');
    }

    // 记录上传开始
    logger.info('开始上传图片', {
      timestamp: new Date().toISOString()
    });

    const timestamp = Date.now();
    const originalKey = `original_${timestamp}.jpg`;
    const processedKey = `matting_${timestamp}.png`;

    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_TENCENT_CLOUD_BUCKET,
      Region: process.env.NEXT_PUBLIC_TENCENT_CLOUD_REGION,
      Key: originalKey,
      Body: Buffer.from(image_base64, 'base64'),
      Headers: {
        'Pic-Operations': JSON.stringify({
          is_pic_info: 1,
          rules: [{
            fileid: processedKey,
            rule: 'ci-process=AIPicMatting'
          }]
        })
      }
    };

    // 记录上传参数（排除敏感信息）
    logger.info('上传参数', {
      bucket: uploadParams.Bucket,
      region: uploadParams.Region,
      key: uploadParams.Key,
      bodySize: uploadParams.Body.length,
      timestamp: new Date().toISOString()
    });

    // 执行上传
    const result = await new Promise((resolve, reject) => {
      cos.putObject(uploadParams, (err, data) => {
        if (err) {
          logger.error('上传失败', {
            error: err,
            timestamp: new Date().toISOString()
          });
          reject(err);
          return;
        }
        
        logger.info('上传成功', {
          data: data,
          timestamp: new Date().toISOString()
        });
        
        resolve(data);
      });
    });

    // 验证上传结果
    try {
      await verifyUpload(uploadParams);
    } catch (verifyErr) {
      logger.error('上传验证失败', {
        error: verifyErr,
        timestamp: new Date().toISOString()
      });
      throw verifyErr;
    }

    // 构建返回URL
    const processedImageUrl = `https://${process.env.NEXT_PUBLIC_TENCENT_CLOUD_BUCKET_DOMAIN}/${processedKey}`;
    
    // 获取处理后的图片数据
    const processedImageData = await new Promise((resolve, reject) => {
      cos.getObject({
        Bucket: process.env.NEXT_PUBLIC_TENCENT_CLOUD_BUCKET,
        Region: process.env.NEXT_PUBLIC_TENCENT_CLOUD_REGION,
        Key: processedKey,
      }, (err, data) => {
        if (err) {
          logger.error('获取处理后图片失败', {
            error: err,
            timestamp: new Date().toISOString()
          });
          reject(err);
          return;
        }
        
        // 将图片数据转换为 base64
        const base64Data = data.Body.toString('base64');
        resolve(base64Data);
      });
    });

    // 记录完整处理结果
    logger.info('处理完成', {
      originalKey,
      processedKey,
      processedImageUrl,
      result,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      data: {
        foreground_image: `data:image/png;base64,${processedImageData}`
      },
      message: '抠图处理成功'
    });

  } catch (err) {
    logger.error('请求失败', {
      error: {
        message: err.message,
        stack: err.stack
      },
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      message: err.message || '处理失败'
    });
  }
}
