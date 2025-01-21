import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import LogoAnimation from '@/components/LogoAnimation';
import { newsData } from './message.js';  
import styles from '@/styles/modules/pages/message.module.css';  

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const products = [
    { 
      id: 1, 
      name: '磁吸宠物手机壳', 
      image: '/images/pet-phone-case.jpg', 
      desc: '支持MagSafe无线充电，镜面磁吸设计，完美展现爱宠形象',
      features: ['磁吸设计', '无线充电', '高清打印', '防摔保护']
    },
    { 
      id: 2, 
      name: '宠物油画定制', 
      image: '/images/pet-portrait.jpg', 
      desc: '专业画师手绘，将您的爱宠化身艺术画作',
      features: ['专业画师', '精细绘制', '多种风格', '装裱配框']
    },
    { 
      id: 3, 
      name: '创意宠物抱枕', 
      image: '/images/pet-pillow.jpg', 
      desc: '不规则造型设计，双面印刷，让爱宠陪伴左右',
      features: ['双面印刷', '创意造型', '柔软舒适', '可机洗']
    },
    { 
      id: 4, 
      name: '宠物定制地毯', 
      image: '/images/pet-carpet.jpg', 
      desc: '真丝绒面料，圆形设计，为家增添温馨',
      features: ['真丝绒面', '防滑底部', '可机洗', '圆形设计']
    },
  ];

  const recentNews = newsData.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <Link href="/message">
            <motion.button 
              className="button secondary"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(124, 58, 237, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              了解更多
            </motion.button>
          </Link>
        </motion.div>

        {/* 底部内容区域 */}
        <motion.div 
          className="bottom-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* 信息流区域 */}
          <div className="news-section">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
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
            <div className="news-more">
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
          <div className="products-section">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              定制商品展示
            </motion.h2>
            <div className="products-grid">
              {products.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  className="product-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="product-image" style={{ backgroundImage: `url(${product.image})` }} />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-features">
                      {product.features.map((feature, i) => (
                        <span key={i} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
