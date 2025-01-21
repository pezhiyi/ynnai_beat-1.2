import { useState } from 'react';
import styles from './LoginModal.module.css';
import { HiX } from 'react-icons/hi';
import Toast from '../UI/Toast';

export default function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login submitted:', formData);
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setShowToast(true);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>登录</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <HiX size={24} />
          </button>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              name="password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            登录
          </button>
        </form>

        <div className={styles.footer}>
          还没有账号？
          <a href="#" className={styles.footerLink} onClick={handleRegisterClick}>
            立即注册
          </a>
        </div>
      </div>
      {showToast && (
        <Toast 
          message="尊贵的内测用户，您无需注册！" 
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </div>
  );
}
