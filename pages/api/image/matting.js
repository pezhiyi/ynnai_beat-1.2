import Logger from '@/utils/api/logger';
import { APIError, ErrorTypes } from '@/utils/api/error-handler';
import { success, error } from '@/utils/api/response';
import COS from 'cos-nodejs-sdk-v5';
import xml2js from 'xml2js';

const cos = new COS({
  SecretId: process.env.TENCENT_CLOUD_SECRET_ID,
  SecretKey: process.env.TENCENT_CLOUD_SECRET_KEY,
});

export default async function handler(req, res) {
  const logger = Logger.forRequest();
  
  try {
    logger.info('API Request Started', {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      }
    });

    if (req.method !== 'POST') {
      throw new APIError(
        ErrorTypes.METHOD_NOT_ALLOWED.code,
        ErrorTypes.METHOD_NOT_ALLOWED.message,
        ErrorTypes.METHOD_NOT_ALLOWED.status
      );
    }

    const { image_base64 } = req.body;
    
    logger.info('Image Data Received', {
      hasImage: !!image_base64,
      dataLength: image_base64?.length || 0,
      truncatedData: image_base64?.substring(0, 50) + '...'
    });

    if (!image_base64) {
      throw new APIError(
        ErrorTypes.INVALID_INPUT.code,
        '缺少图片数据',
        ErrorTypes.INVALID_INPUT.status
      );
    }

    logger.info('Processing Request');

    const bucket = 'ynnai-1256269009';
    const region = 'ap-guangzhou';
    const key = 'ynnai_koutu';

    const params = {
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: Buffer.from(image_base64, 'base64'),
      Headers: {
        'Pic-Operations': JSON.stringify({
          is_pic_info: 1,
          rules: [{
            fileid: 'exampleobject',
            rule: 'ci-process=AIPicMatting'
          }]
        })
      }
    };

    cos.putObject(params, (err, data) => {
      if (err) {
        logger.error('COS Upload Failed', { error: err });
        throw new APIError(
          ErrorTypes.INTERNAL_ERROR.code,
          err.message,
          ErrorTypes.INTERNAL_ERROR.status
        );
      }

      xml2js.parseString(data.Body, (parseErr, result) => {
        if (parseErr) {
          logger.error('XML Parsing Failed', { error: parseErr });
          throw new APIError(
            ErrorTypes.INTERNAL_ERROR.code,
            'XML 解析失败',
            ErrorTypes.INTERNAL_ERROR.status
          );
        }

        const processResults = result.UploadResult.ProcessResults[0].Object[0];
        const processedImageLocation = processResults.Location[0];

        logger.info('COS Upload Success', { data });

        return res.status(200).json(success(
          { foreground_image: processedImageLocation },
          '抠图处理成功',
          logger.requestId,
          Date.now() - logger.startTime
        ));
      });
    });

  } catch (err) {
    logger.error('Request Failed', {
      error: {
        message: err.message,
        stack: err.stack?.split('\n'),
        type: err.name
      },
      timeElapsed: `${Date.now() - logger.startTime}ms`
    });

    const errorResponse = error(
      err.code || ErrorTypes.INTERNAL_ERROR.code,
      err.message || ErrorTypes.INTERNAL_ERROR.message,
      logger.requestId,
      Date.now() - logger.startTime
    );

    return res.status(err.status || 500).json(errorResponse);
  }
}
