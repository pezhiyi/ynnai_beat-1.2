import { useCallback } from 'react';

export default function ImageUploader({ onUpload }) {
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  return (
    <div className="uploader">
      <label className="upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <span>点击或拖拽图片到此处</span>
      </label>
    </div>
  );
}
