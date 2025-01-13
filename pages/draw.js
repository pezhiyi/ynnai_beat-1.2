import { useState, useCallback } from 'react';
import Layout from '@/components/Layout/Layout';
import Canvas from '@/components/Canvas/Canvas';
import Toolbar from '@/components/Canvas/Toolbar';
import ImageUploader from '@/components/Common/ImageUploader';
import Loading from '@/components/Common/Loading';

export default function Draw() {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);

  const handleUpload = useCallback((url) => {
    setImageUrl(url);
  }, []);

  const handleToolSelect = useCallback((toolId) => {
    setCurrentTool(toolId);
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // 实现保存逻辑
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Layout>
      <div className="draw-container">
        {!imageUrl ? (
          <ImageUploader onUpload={handleUpload} />
        ) : (
          <>
            <Canvas imageUrl={imageUrl} tool={currentTool} />
            <Toolbar onTool={handleToolSelect} />
            <button onClick={handleSave} className="save-button">
              保存
            </button>
          </>
        )}
        {isLoading && <Loading />}
      </div>
    </Layout>
  );
}
