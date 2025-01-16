import COS from 'cos-nodejs-sdk-v5';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const cos = new COS({
  SecretId: 'AKIDcDboqlTyGML7ua9kDVfeR5Yryu1xqfM4',
  SecretKey: '1rY4NVQAh2A4lEYijYAYs31lKjwwhEZk',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting file upload process...');
    
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    console.log('Files received:', files);
    console.log('Fields received:', fields);
    
    const file = files?.file?.[0]; // formidable v3 returns an array
    
    if (!file) {
      console.error('No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { dateDir, timestamp, styleId } = fields;
    if (!dateDir || !timestamp || !styleId) {
      throw new Error('Missing required fields');
    }

    console.log('File info:', {
      path: file.filepath || file.path,
      size: file.size,
      type: file.mimetype || file.type,
      dateDir,
      timestamp,
      styleId,
    });

    const filePath = file.filepath || file.path;
    if (!filePath) {
      throw new Error('File path not found');
    }

    // 构建文件路径: YnnAi_print/日期/YnnAI-时间戳_风格英文
    const fileName = `YnnAi_print/${dateDir}/YnnAI-${timestamp}_${styleId}.png`;
    const fileContent = await fs.promises.readFile(filePath);

    console.log('Uploading to COS with fileName:', fileName);
    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: 'ynnai-1256269009',
        Region: 'ap-guangzhou',
        Key: fileName,
        Body: fileContent,
      }, (err, data) => {
        if (err) {
          console.error('COS upload error:', err);
          reject(err);
          return;
        }
        console.log('COS upload success:', data);
        resolve(data);
      });
    });

    // 清理临时文件
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      console.warn('Failed to delete temp file:', unlinkError);
    }

    const url = `https://ynnai-1256269009.cos.ap-guangzhou.myqcloud.com/${fileName}`;
    console.log('Upload complete, returning URL:', url);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Upload process error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      stack: error.stack
    });
  }
}