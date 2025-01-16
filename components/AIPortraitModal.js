import { motion, AnimatePresence } from 'framer-motion';

const AIPortraitModal = ({ isOpen, onClose, onSelect }) => {
  const handleOptionClick = (optionId) => {
    onSelect(optionId);
  };

  const options = [
    {
      id: 'pet-modern',
      title: '宠物现代画像',
      subtitle: 'Modern Pet Portrait',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
          <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/>
          <path d="M8 14v.5"/>
          <path d="M16 14v.5"/>
          <path d="M11.25 16.25h1.5L12 17l-.75-.75z"/>
          <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/>
        </svg>
      ),
    },
    {
      id: 'pet-oil',
      title: '宠物油画',
      subtitle: 'Pet Oil Painting',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12c0-3.314 4.03-6 9-6s9 2.686 9 6-4.03 6-9 6-9-2.686-9-6z"/>
          <path d="M12 12v6"/>
          <path d="M8 14v4"/>
          <path d="M16 14v4"/>
          <path d="M2 12h20"/>
        </svg>
      ),
    },
    {
      id: 'human-cartoon',
      title: '人物卡通画像',
      subtitle: 'Character Cartoon',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5"/>
          <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/>
        </svg>
      ),
    },
    {
      id: 'human-newmasus',
      title: '人物Newmasus',
      subtitle: 'Newmasus Style',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
          <path d="M8 7h8"/>
          <path d="M8 11h8"/>
          <path d="M8 15h5"/>
        </svg>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ai-portrait-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="modal-header">
            <h3 className="modal-title">选择风格</h3>
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="关闭"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
              </svg>
            </button>
          </div>

          <div className="portrait-options">
            {options.map((option) => (
              <motion.div
                key={option.id}
                className="portrait-option"
                onClick={() => handleOptionClick(option.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {option.icon}
                <div className="option-text">
                  <span className="option-title">{option.title}</span>
                  <span className="option-subtitle">{option.subtitle}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="safe-area-bottom" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIPortraitModal;
