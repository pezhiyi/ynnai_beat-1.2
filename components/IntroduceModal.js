import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from '@/styles/modules/components/introduce-modal.module.css';
import { FaTimes, FaUsers, FaEnvelope } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function IntroduceModal({ isOpen, onClose }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    'AI图像技术完成设计',
    '零成本先出设计后制作',
    '智能化准时交付',
    '可视化物流跟踪'
  ];

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const handleContactClick = () => {
    window.location.href = 'mailto:support@ynnai.com';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>关于我们</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.imageContainer}>
                <Image
                  src="/images/introduce.png"
                  alt="YnnAI平台介绍"
                  width={400}
                  height={300}
                  className={styles.introduceImage}
                  priority
                />
              </div>

              <div className={styles.textContent}>
                <p className={styles.description}>
                  印-YnnAI平台以AI大模型技术为驱动，提供选品、设计、生产、物流、售后等一站式服务。
                </p>

                <div className={styles.featuresList}>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className={styles.featureItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className={styles.featureIcon}>✦</div>
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.buttonGroup}>
                  <button 
                    className={styles.teamButton} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTeam(true);
                    }}
                  >
                    <FaUsers className={styles.buttonIcon} />
                    共创名单
                  </button>

                  <button 
                    className={styles.contactButton}
                    onClick={handleContactClick}
                  >
                    <FaEnvelope className={styles.buttonIcon} />
                    联系我们
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {showTeam && (
            <motion.div
              className={styles.teamModalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTeam(false)}
            >
              <motion.div
                className={styles.teamModal}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.teamContent}>
                  <div className={styles.logoContainer}>
                    <Image
                      src="/images/logo_all.png"
                      alt="YnnAI Logo"
                      width={120}
                      height={40}
                      className={styles.logo}
                      priority
                    />
                  </div>
                  <div>
                    <h3>联合创始人</h3>
                    <p className={styles.foundersList}>
                      {['彭智毅', '刘卓成', '伍星'].map((name, index) => (
                        <span key={index} className={styles.nameItem}>{name}</span>
                      ))}
                    </p>
                  </div>
                  <div>
                    <h3>共创者</h3>
                    <p className={styles.nameList}>
                      {['曹汉明', '林鸿智', '彭竞瑄', '徐杰昕'].map((name, index) => (
                        <span key={index} className={styles.nameItem}>{name}</span>
                      ))}
                    </p>
                  </div>
                  <button 
                    className={styles.closeTeamButton}
                    onClick={() => setShowTeam(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
