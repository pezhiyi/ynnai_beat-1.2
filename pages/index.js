import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { newsData } from './message.js';  
import styles from '@/styles/modules/pages/message.module.css';
import dropdownStyles from '@/styles/modules/components/dropdown.module.css';
import { productsData } from '@/data/products';
import { FaInfoCircle, FaPalette, FaLightbulb, FaBox, FaTasks, FaTimes, FaUserCircle } from 'react-icons/fa';

// 动态导入组件
const LogoAnimation = dynamic(() => import('@/components/LogoAnimation'), { ssr: false });
const LoginModal = dynamic(() => import('@/components/Auth/LoginModal'), { ssr: false });
const IntroduceModal = dynamic(() => import('@/components/IntroduceModal'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showIntroduceModal, setShowIntroduceModal] = useState(false);

  // 获取前4个商品，使用useMemo优化
  const featuredProducts = productsData.slice(0, 4);
  const recentNews = newsData.slice(0, 5);

  // 延迟加载非关键内容
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 菜单选项
  const menuItems = [
    {
      title: '关于我们',
      desc: '网站作用',
      icon: <FaInfoCircle className={dropdownStyles.menuItemIcon} />,
      action: () => {
        setShowModal(false);
        setShowIntroduceModal(true);
      }
    },
    {
      title: '开始设计',
      desc: '帮助创作',
      icon: <FaPalette className={dropdownStyles.menuItemIcon} />,
      href: '/draw',
      primary: true
    },
    {
      title: '灵感社区',
      desc: '提供创意',
      icon: <FaLightbulb className={dropdownStyles.menuItemIcon} />,
      href: '/message'
    },
    {
      title: '商品定制',
      desc: '制作产品',
      icon: <FaBox className={dropdownStyles.menuItemIcon} />,
      href: '/products'
    },
    {
      title: '订单管理',
      desc: '发货追踪',
      icon: <FaTasks className={dropdownStyles.menuItemIcon} />,
      href: '/orders/orderManagement'
    },
    {
      title: '用户登录',
      desc: '账号管理',
      icon: <FaUserCircle className={dropdownStyles.menuItemIcon} />,
      action: () => setShowLoginModal(true)
    }
  ];

  return (
    <Layout>
      <div className="home-container">
        {/* 动态背景 */}
        <div className="animated-background">
          <div className="gradient-sphere"></div>
          <div className="gradient-sphere"></div>
          <div className="gradient-sphere"></div>
          <motion.div 
            className="design-elements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="design-circle"></div>
            <div className="design-square"></div>
            <div className="design-dots"></div>
          </motion.div>
        </div>

        {/* Logo区域 */}
        <motion.div 
          className="logo-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <LogoAnimation />
        </motion.div>

        {/* 按钮区域 */}
        <motion.div 
          className="cta-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link href="/draw">
            <motion.button 
              className="button primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              开始设计
            </motion.button>
          </Link>
          <motion.button 
            className="button secondary"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(124, 58, 237, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
          >
            了解更多
          </motion.button>

          {/* 功能导航弹窗 */}
          <div className={`${dropdownStyles.modalOverlay} ${showModal ? dropdownStyles.show : ''}`} onClick={() => setShowModal(false)}>
            <div className={dropdownStyles.modal} onClick={e => e.stopPropagation()}>
              <div className={dropdownStyles.modalHeader}>
                <div className={dropdownStyles.modalTitle}>功能导航</div>
                <button className={dropdownStyles.closeButton} onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className={dropdownStyles.menuGrid}>
                {menuItems.map((item, index) => (
                  item.action ? (
                    <div 
                      key={item.title}
                      className={`${dropdownStyles.menuItem} ${item.primary ? dropdownStyles.primary : ''}`}
                      onClick={() => {
                        setShowModal(false);
                        item.action();
                      }}
                    >
                      {item.icon}
                      <div className={dropdownStyles.menuItemTitle}>{item.title}</div>
                      <div className={dropdownStyles.menuItemDesc}>{item.desc}</div>
                    </div>
                  ) : (
                    <Link href={item.href} key={item.title}>
                      <div 
                        className={`${dropdownStyles.menuItem} ${item.primary ? dropdownStyles.primary : ''}`}
                        onClick={() => setShowModal(false)}
                      >
                        {item.icon}
                        <div className={dropdownStyles.menuItemTitle}>{item.title}</div>
                        <div className={dropdownStyles.menuItemDesc}>{item.desc}</div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* 登录弹窗 */}
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />

          {/* 关于我们弹窗 */}
          <IntroduceModal
            isOpen={showIntroduceModal}
            onClose={() => setShowIntroduceModal(false)}
          />
        </motion.div>

        {/* 底部内容区域 */}
        <motion.div 
          className="bottom-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* 资讯动态区域 */}
          <div className={styles.newsSection}>
            <motion.h2 
              className={styles['section-title']}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              最新动态
            </motion.h2>
            <div className={styles['news-feed']}>
              {recentNews.map((news, index) => (
                <Link href={`/news/${news.id}`} key={news.id}>
                  <motion.article 
                    className={styles.newsItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div 
                      className={styles.newsImage}
                      style={{
                        backgroundImage: `url(${news.image})`,
                      }}
                    />
                    <div className={styles.newsContent}>
                      <h3 className={styles.newsTitle}>{news.title}</h3>
                      <p className={styles.newsDesc}>{news.desc}</p>
                      <div className={styles.newsFooter}>
                        <span className={styles.newsDate}>{news.date}</span>
                        <span className={styles.newsCategory}>{news.category}</span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
            <div className={styles.newsMore}>
              <Link href="/message">
                <motion.button 
                  className="button secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  查看更多资讯
                </motion.button>
              </Link>
            </div>
          </div>

          {/* 商品展示区域 */}
          <div className={styles.productsSection} style={{ marginTop: '2rem' }}>
            <motion.h2 
              className={styles['section-title']}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              定制商品展示
            </motion.h2>
            <motion.div 
              className={styles.productsGrid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className={styles.productCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.1 + index * 0.05,
                    ease: 'easeOut'
                  }}
                  style={{ 
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className={styles.productImage}>
                    <Image 
                      src={product.image} 
                      alt={product.title}
                      width={300}
                      height={300}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJiEwST4xMDU+MDI0SmFGNz5QVWJXTjk1UFdfWnFlk2NwYdJsc2H/2wBDARUXFx4aHR4eHUJhQmFCYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      quality={75}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden'
                      }}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <div className={styles.productFeatures}>
                      {product.features.map((feature, i) => (
                        <span key={i} className={styles.featureTag}>{feature}</span>
                      ))}
                    </div>
                    <div className={styles.productFooter}>
                      <span className={styles.price}>{product.price}</span>
                      <Link href="/draw">
                        <button className={styles.customizeBtn}>立即定制</button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              className="more-products-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/products">
                <motion.button 
                  className="view-more-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  定制更多
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
