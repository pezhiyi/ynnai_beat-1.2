import { useEffect } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, duration = 2000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={styles.toast}>
      {message}
    </div>
  );
}
