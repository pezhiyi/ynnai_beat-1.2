import { useState } from 'react';

export default function Toolbar({ onTool }) {
  const tools = [
    { id: 'crop', name: '裁剪' },
    { id: 'rotate', name: '旋转' },
    { id: 'remove-bg', name: '抠图' }
  ];

  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onTool(tool.id)}
          className="tool-button"
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}
