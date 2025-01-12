import { useState } from 'react';

export default function Toolbar({ onTool }) {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    { id: 'crop', name: '裁剪' },
    { id: 'rotate', name: '旋转' },
    { id: 'remove-bg', name: '抠图' },
    { id: 'resize', name: '缩放' }
  ];

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);
    onTool?.(toolId);
  };

  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => handleToolClick(tool.id)}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}
