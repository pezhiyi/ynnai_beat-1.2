import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import styles from '@/styles/modules/pages/products.module.css';
import { productsData } from '@/data/products';

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
          <meta name="description" content="YnnAI 商品定制页面，提供各种个性化定制商品" />
        </Head>

        <main className={styles.main}>
          <motion.div 
            className={styles.categoryNav}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
