import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // 示例商品数据
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

  // 示例信息流数据
  const newsFeeds = [
    { 
      id: 1, 
      title: '磁吸宠物手机壳新品上市', 
      date: '2024-03-20',
      desc: '支持iPhone 15/16全系列，MagSafe磁吸无线充电，镜面质感高清打印，完美展现爱宠形象，防摔保护',
      image: '/images/news-phone-case.jpg',
      link: '/products/phone-case'
    },
    { 
      id: 2, 
      title: '宠物油画肖像定制服务', 
      date: '2024-03-19',
      desc: '专业画师手绘，多种艺术风格可选，精细绘制爱宠形象，配套高档画框，为爱宠留下永恒艺术记忆',
      image: '/images/news-portrait.jpg',
      link: '/products/portrait'
    },
    { 
      id: 3, 
      title: '创意宠物抱枕新品发布', 
      date: '2024-03-18',
      desc: '不规则造型设计，双面高清印刷，柔软舒适可机洗，让爱宠陪伴在身边的温暖选择',
      image: '/images/news-pillow.jpg',
      link: '/products/pillow'
    },
    {
      id: 4,
      title: '宠物定制真丝绒地毯上新',
      date: '2024-03-17',
      desc: '高品质真丝绒面料，圆形艺术设计，防滑底部，可机洗，为家增添独特温馨氛围',
      image: '/images/news-carpet.jpg',
      link: '/products/carpet'
    },
    {
      id: 5,
      title: '新年宠物定制红包限量发售',
      date: '2024-03-16',
      desc: '精美烫金工艺，个性化宠物图案，新年送礼必备，让红包更有爱的温度',
      image: '/images/news-envelope.jpg',
      link: '/products/envelope'
    },
    {
      id: 6,
      title: '温暖宠物定制毛毯开售',
      date: '2024-03-15',
      desc: '超柔软亲肤面料，高清数码印刷，大尺寸设计，让爱宠陪你温暖每个夜晚',
      image: '/images/news-blanket.jpg',
      link: '/products/blanket'
    },
    {
      id: 7,
      title: '定制宠物印花服装系列',
      date: '2024-03-14',
      desc: '多款版型可选，优质面料舒适透气，将爱宠图案完美呈现在衣服上，展现独特时尚态度',
      image: '/images/news-clothing.jpg',
      link: '/products/clothing'
    },
    {
      id: 8,
      title: '创意宠物气囊支架首发',
      date: '2024-03-13',
      desc: '手工滴胶工艺，高透质感，磁吸式设计，让爱宠陪伴手机每一刻',
      image: '/images/news-stand.jpg',
      link: '/products/stand'
    },
    {
      id: 9,
      title: '星蝶公主风画像定制上线',
      date: '2024-03-12',
      desc: '独特星蝶公主艺术风格，专业画师手绘，为你的照片注入梦幻魔法',
      image: '/images/news-butterfly.jpg',
      link: '/products/butterfly'
    },
    {
      id: 10,
      title: 'Newmasus艺术画像定制',
      date: '2024-03-11',
      desc: '特色油画棒蜡笔风格，将照片转化为独特艺术形象，创造专属艺术记忆',
      image: '/images/news-newmasus.jpg',
      link: '/products/newmasus'
    }
  ];

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="logo-wrapper"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.h1 
              className="logo"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <motion.span 
                className="ynn"
                data-text="Ynn"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Ynn
              </motion.span>
              <motion.span 
                className="dot"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                .
              </motion.span>
              <motion.span 
                className="ai"
                data-text="AI"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                AI
              </motion.span>
            </motion.h1>
            <motion.div 
              className="logo-shine"
              animate={{ 
                x: ["-200%", "200%"],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 5
              }}
            />
          </motion.div>
          
          <motion.h2 
            className="main-slogan"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            人人都是超级设计师
          </motion.h2>
          <motion.p 
            className="sub-slogan"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            AI驱动一站式定制商品落地
          </motion.p>
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
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            了解更多
          </motion.button>
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
            <div className="news-feed">
              {newsFeeds.map((news, index) => (
                <Link href={news.link} key={news.id}>
                  <motion.div 
                    className="news-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <div className="news-image" style={{ backgroundImage: `url(${news.image})` }} />
                    <div className="news-content">
                      <span className="news-date">{news.date}</span>
                      <h3 className="news-title">{news.title}</h3>
                      <p className="news-desc">{news.desc}</p>
                    </div>
                    <motion.div 
                      className="news-arrow"
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.div>
                  </motion.div>
                </Link>
              ))}
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

