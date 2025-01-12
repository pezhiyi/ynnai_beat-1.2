import { useCallback } from 'react';

export default function ImageUploader({ onUpload }) {
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // 处理文件上传
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        onUpload?.(data.url);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  }, [onUpload]);

  return (
    <div className="uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
    </div>
  );
}
