import { useEffect, useState } from 'react';
import styles from '../styles/modules/components/edit-hint.module.css';

const EditHint = ({ onHintClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    if (onHintClick) onHintClick();
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.editHint} ${styles.visible}`} onClick={handleClick}>
      <div className={styles.hintContent}>
        点击激活图层编辑器
      </div>
    </div>
  );
};

export default EditHint;
