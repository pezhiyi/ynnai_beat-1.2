import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import styles from '@/styles/modules/pages/products.module.css';

const productsData = [
  { 
    id: 1, 
    title: '定制棒球帽', 
    image: '/images/product_image/custom-cap.jpg', 
    description: '优质棉质面料，3D刺绣工艺，可调节帽围，舒适透气',
    features: ['3D刺绣', '可调节帽围', '优质棉料', '多色可选'],
    price: '¥89起',
    category: '服饰配件'
  },
  { 
    id: 2, 
    title: '个性定制T恤', 
    image: '/images/product_image/custom-tshirt.jpg', 
    description: '100%精梳棉，数码直喷印花，舒适面料，个性图案',
    features: ['精梳棉', '数码印花', '多尺码', '快速出货'],
    price: '¥129起',
    category: '服饰配件'
  },
  { 
    id: 3, 
    title: '创意马克杯', 
    image: '/images/product_image/custom-mug.jpg', 
    description: '陶瓷材质，个性图案定制，微波炉可用，送礼首选',
    features: ['陶瓷材质', '个性定制', '微波可用', '礼盒包装'],
    price: '¥69起',
    category: '日常用品'
  },
  { 
    id: 4, 
    title: '艺术帆布包', 
    image: '/images/product_image/custom-bag.jpg', 
    description: '加厚帆布材质，个性印花图案，大容量设计，环保耐用',
    features: ['加厚帆布', '个性印花', '大容量', '环保材质'],
    price: '¥99起',
    category: '服饰配件'
  },
  { 
    id: 5, 
    title: '定制手机壳', 
    image: '/images/product_image/custom-phonecase.jpg', 
    description: '多机型支持，UV打印工艺，防摔设计，完美贴合',
    features: ['UV打印', '防摔设计', '多机型', '快速定制'],
    price: '¥79起',
    category: '数码配件'
  },
  { 
    id: 6, 
    title: '个性抱枕', 
    image: '/images/product_image/custom-pillow.jpg', 
    description: '优质绒面，双面可印，柔软舒适，装饰美观',
    features: ['双面印花', '柔软舒适', '可机洗', '赠内芯'],
    price: '¥89起',
    category: '家居饰品'
  },
  { 
    id: 7, 
    title: '定制挂画', 
    image: '/images/product_image/custom-painting.jpg', 
    description: '高清微喷，多种尺寸，专业装裱，悬挂方便',
    features: ['高清微喷', '专业装裱', '多尺寸', '防水防潮'],
    price: '¥199起',
    category: '家居饰品'
  },
  { 
    id: 8, 
    title: '个性鼠标垫', 
    image: '/images/product_image/custom-mousepad.jpg', 
    description: '天然橡胶，防滑底部，精密锁边，游戏办公皆宜',
    features: ['防滑底部', '精密锁边', '高清印刷', '耐磨面料'],
    price: '¥49起',
    category: '数码配件'
  },
  { 
    id: 9, 
    title: '定制笔记本', 
    image: '/images/product_image/custom-notebook.jpg', 
    description: '进口纸张，个性封面，精美装订，书写流畅',
    features: ['进口纸张', '个性封面', '精美装订', 'PU封皮'],
    price: '¥59起',
    category: '日常用品'
  },
  { 
    id: 10, 
    title: '定制帆布鞋', 
    image: '/images/product_image/custom-shoes.jpg', 
    description: '优质帆布，个性印花，舒适鞋垫，百搭款式',
    features: ['优质帆布', '个性印花', '舒适鞋垫', '防滑底部'],
    price: '¥199起',
    category: '服饰配件'
  },
];

const categories = ['全部', '服饰配件', '数码配件', '家居饰品', '日常用品'];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [filteredProducts, setFilteredProducts] = useState(productsData);

  useEffect(() => {
    if (activeCategory === '全部') {
      setFilteredProducts(productsData);
    } else {
      setFilteredProducts(productsData.filter(product => product.category === activeCategory));
    }
  }, [activeCategory]);

  return (
    <Layout>
      <div className={styles.container}>
        <Head>
          <title>商品定制 - YnnAI Beat</title>
          <meta name="description" content="YnnAI Beat 商品定制页面，提供各种个性化定制商品" />
        </Head>

        <main className={styles.main}>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            商品定制
          </motion.h1>
          
          <motion.div 
            className={styles.categoryNav}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </motion.div>

          <motion.div 
            className={styles.productsGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className={styles.productCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className={styles.productImage}>
                  <Image
                    src={product.image}
                    alt={product.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  <div className={styles.productFeatures}>
                    {product.features.map((feature, index) => (
                      <span key={index} className={styles.feature}>{feature}</span>
                    ))}
                  </div>
                  <div className={styles.productFooter}>
                    <span className={styles.price}>{product.price}</span>
                    <Link href="/draw">
                      <button className={styles.customizeButton}>立即定制</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </Layout>
  );
}
