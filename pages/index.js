import { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '../config/siteConfig';
import Layout from '../components/Layout/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="home-container">
        <h1>{siteConfig.title}</h1>
        <p className="description">{siteConfig.description}</p>
        
        <div className="features">
          <div className="feature-item">
            <h3>AI 抠图</h3>
            <p>智能识别前景，一键移除背景</p>
          </div>
          <div className="feature-item">
            <h3>图像编辑</h3>
            <p>裁剪、旋转、缩放等基础功能</p>
          </div>
          <div className="feature-item">
            <h3>移动优化</h3>
            <p>触控友好的操作体验</p>
          </div>
        </div>

        <div className="cta-buttons">
          <Link href="/draw" className="button primary">
            开始编辑
          </Link>
        </div>
      </div>
    </Layout>
  );
}
