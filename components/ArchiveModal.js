import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlotSelector from '../services/slotService/SlotSelector';
import ImagePreview from './ImagePreview';

/**
 * 存档仓库模态框组件
 * 
 * 重要说明：
 * 1. 槽位数据结构：
 *    - id: 槽位ID (0-3)
 *    - status: 状态 ('empty'|'loading'|'ready')
 *    - isActive: 是否可用
 *    - previewUrl: 预览图片URL (带签名)
 *    - cosUrl: COS存储路径
 *    - name: 文件名
 * 
 * 2. 状态管理：
 *    - 槽位状态由 SlotSelector 统一管理
 *    - 不要直接修改 slots 状态，应通过 SlotSelector 的方法
 * 
 * 3. 图片存储：
 *    - 图片永久存储在 COS 的 Feedback 目录
 *    - 按日期分类：Feedback/{YYYYMMDD}/
 *    - 文件名格式：YnnAI-{timestamp}_{styleId}-feedback.png
 * 
 * 4. 安全提示：
 *    - 删除操作不可恢复
 *    - 预览URL有2小时有效期
 *    - 不要修改 SlotSelector 的事件监听逻辑
 */
const ArchiveModal = ({ isOpen, onClose, onLoad }) => {
  if (!isOpen) return null;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const slotSelector = SlotSelector.getInstance();

  useEffect(() => {
    const handleSlotUpdate = (event) => {
      const { detail } = event;
      console.log('存档仓库收到槽位更新事件:', detail);
      setSlots(prevSlots => {
        const newSlots = [...prevSlots];
        const index = detail.id;
        console.log('更新槽位索引:', index);
        console.log('更新前槽位数据:', newSlots[index]);
        newSlots[index] = {
          ...newSlots[index],
          ...detail
        };
        console.log('更新后槽位数据:', newSlots[index]);
        console.log('所有槽位状态:', newSlots);
        return newSlots;
      });
    };

    // 初始化槽位状态
    const initSlots = async () => {
      console.log('开始初始化槽位状态');
      const allSlots = [];
      for (let i = 0; i < 4; i++) {
        const slotInfo = await slotSelector.getSlotInfo(i);
        console.log(`槽位 ${i} 信息:`, slotInfo);
        allSlots[i] = slotInfo || { id: i };
      }
      console.log('初始化完成，所有槽位:', allSlots);
      setSlots(allSlots);
    };
    
    // 如果弹窗打开时初始化槽位
    if (isOpen) {
      console.log('存档仓库打开，初始化槽位');
      initSlots();
    }

    // 监听槽位更新
    console.log('添加槽位更新事件监听器');
    window.addEventListener('archiveSlotUpdate', handleSlotUpdate);
    return () => {
      console.log('移除槽位更新事件监听器');
      window.removeEventListener('archiveSlotUpdate', handleSlotUpdate);
    };
  }, [isOpen]); // 添加 isOpen 作为依赖

  return (
    <AnimatePresence>
      {/* 主模态框 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          willChange: 'opacity',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ 
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            willChange: 'transform, opacity',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        >
          {/* 标题栏 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '16px',
            marginBottom: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {/* 图标 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#60A5FA' }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              
              <h2 style={{ 
                margin: 0, 
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '500',
                letterSpacing: '0.025em',
              }}>存档仓库</h2>
            </div>
            
            {/* 标题栏右侧按钮组 */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              {/* 初始化按钮 */}
              <button
                onClick={async () => {
                  if (confirm('⚠️ 警告：此操作将清除所有存档！\n\n确定要初始化所有槽位吗？')) {
                    try {
                      // 停止所有下载任务
                      const slotSelector = SlotSelector.getInstance();
                      slotSelector.stopAllDownloads();
                      
                      // 删除所有 COS 文件
                      const deletePromises = slots
                        .filter(slot => slot?.cosUrl)
                        .map(slot => 
                          fetch(`/api/cos/delete?path=${encodeURIComponent(slot.cosUrl)}`, {
                            method: 'DELETE'
                          })
                        );
                      
                      await Promise.all(deletePromises);
                      
                      // 清除所有槽位数据
                      await slotSelector.clearAllSlots();
                      
                      // 更新本地状态
                      const emptySlots = Array(4).fill(null).map((_, index) => ({
                        id: index,
                        status: 'empty',
                        isActive: false,
                        lastModified: new Date().toISOString(),
                        cosUrl: null,
                        previewUrl: null,
                        name: null
                      }));
                      setSlots(emptySlots);
                      
                      // 关闭预览（如果有）
                      setPreviewImage(null);
                    } catch (error) {
                      console.error('初始化失败:', error);
                      alert('初始化失败，请重试。如果问题持续存在，请联系技术支持。');
                    }
                  }
                }}
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  color: '#FCA5A5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z"></path>
                  <path d="M12 8v8"></path>
                  <path d="M8 12h8"></path>
                </svg>
                初始化槽位
              </button>

              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            </div>
          </div>

          {/* 槽位网格 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            overflow: 'auto',
            padding: '4px',
            marginTop: '8px',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}>
            {slots.map((slot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1]
                }}
                style={{
                  background: slot?.previewUrl 
                    ? `url(${slot.previewUrl}) center/contain no-repeat`
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  aspectRatio: '3/4',
                  cursor: slot?.previewUrl ? 'zoom-in' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  willChange: 'transform, opacity',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                whileHover={slot?.status === 'ready' ? {
                  scale: 1.02,
                  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                } : {}}
                onClick={() => {
                  if (slot?.previewUrl) {
                    setPreviewImage(slot.previewUrl);
                  }
                }}
              >
                {/* 顶部信息栏 - 半透明背景 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#60A5FA' }}>
                      <path d="M12 4v1m6 5h-4m6-6h4M4 12a9 9 0 110 18 9 9 0 010-18z" />
                    </svg>
                    <span style={{ 
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>{slot?.name || '空槽位'}</span>
                  </div>

                  {/* 操作按钮组 */}
                  {slot?.status === 'ready' && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                    }}>
                      {/* 下载按钮 */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (slot.cosUrl) {
                            const response = await fetch(`/api/cos/download?path=${encodeURIComponent(slot.cosUrl)}`);
                            const { url } = await response.json();
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = slot.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>

                      {/* 删除按钮 */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (slot.cosUrl && confirm('⚠️ 警告：此操作不可恢复！\n\n确定要删除这个存档吗？')) {
                            try {
                              await fetch(`/api/cos/delete?path=${encodeURIComponent(slot.cosUrl)}`, {
                                method: 'DELETE'
                              });
                              
                              const slotSelector = SlotSelector.getInstance();
                              await slotSelector.clearSlot(slot.id);
                              
                              const updatedSlots = [...slots];
                              updatedSlots[slot.id] = {
                                id: slot.id,
                                status: 'empty',
                                isActive: false,
                                lastModified: new Date().toISOString()
                              };
                              setSlots(updatedSlots);
                            } catch (error) {
                              console.error('删除失败:', error);
                              alert('删除失败，请重试。如果问题持续存在，请联系技术支持。');
                            }
                          }
                        }}
                        style={{
                          background: 'rgba(220, 38, 38, 0.1)',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* 底部状态栏 - 仅在加载中或空槽位时显示 */}
                {(!slot?.previewUrl || slot?.status === 'loading') && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <span style={{ 
                      color: slot?.status === 'loading' ? '#60A5FA' : 'rgba(255, 255, 255, 0.5)',
                      fontSize: '14px',
                    }}>
                      {slot?.status === 'loading' ? '生成中...' : '空槽位'}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              zIndex: 1001,
              cursor: 'zoom-out',
              willChange: 'opacity',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              src={previewImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                maxWidth: '90%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 32px rgba(0, 0, 0, 0.5)',
                willChange: 'transform, opacity',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
              onClick={e => e.stopPropagation()}
            />
            
            {/* 关闭按钮 */}
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ArchiveModal;
