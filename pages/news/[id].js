import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import styles from '../../styles/modules/pages/newsDetail.module.css';
import { newsData } from '../message';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  // 查找对应的新闻数据
  const newsItem = newsData.find(item => item.id === Number(id));

  // 如果没有找到数据，显示加载状态或404
  if (!newsItem) {
    return (
      <Layout>
        <div className={styles.container}>
          <h1>加载中...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{newsItem.title} - Ynnai Beat</title>
      </Head>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <article className={styles.article}>
          <header className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.category}>{newsItem.category}</span>
              <span className={styles.date}>{newsItem.date}</span>
            </div>
            <h1 className={styles.title}>{newsItem.title}</h1>
          </header>

          <div className={styles.content}>
            <div className={styles.imageWrapper}>
              <Image
                src={newsItem.image}
                alt={newsItem.title}
                width={800}
                height={450}
                className={styles.image}
                priority
              />
            </div>
            
            <div className={styles.description}>
              <p className={styles.summary}>{newsItem.desc}</p>
              
              <div className={styles.details}>
                <h2>产品特点</h2>
                <p>{newsItem.title}的主要特点和优势：</p>
                <ul>
                  {newsItem.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  )) || (
                    <>
                      <li>高品质材料，精工制作，品质保证</li>
                      <li>个性化定制，独特设计，彰显专属风格</li>
                      <li>便捷实用，多场景适用，提升生活品质</li>
                    </>
                  )}
                </ul>

                <h2>使用说明</h2>
                <div className={styles.usageGuide}>
                  <p>使用步骤：</p>
                  <ol>
                    {newsItem.usage?.map((step, index) => (
                      <li key={index}>{step}</li>
                    )) || (
                      <>
                        <li>选择您喜欢的款式和规格</li>
                        <li>上传高清宠物照片</li>
                        <li>确认设计效果</li>
                        <li>完成订制</li>
                      </>
                    )}
                  </ol>
                </div>

                {newsItem.additionalInfo && (
                  <div className={styles.additionalInfo}>
                    <h2>补充信息</h2>
                    <p>{newsItem.additionalInfo}</p>
                  </div>
                )}

                <div className={styles.contact}>
                  <h2>咨询与支持</h2>
                  <p>如果您对{newsItem.title}有任何疑问，欢迎通过以下方式联系我们：</p>
                  <ul>
                    <li>客服电话：13640802760</li>
                    <li>在线客服：每周一至周日 24:00-24:00</li>
                    <li>电子邮箱：support@ynnai.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className={styles.actions}>
          <button 
            className={styles.backButton}
            onClick={() => router.back()}
          >
            返回上一页
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}
