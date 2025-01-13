import Link from 'next/link';
import Layout from '../components/Layout/Layout';

export default function Custom404() {
  return (
    <Layout>
      <div className="error-container">
        <h1>404 - 页面未找到</h1>
        <p>抱歉，您访问的页面不存在。</p>
        <Link href="/" className="button primary">
          返回首页
        </Link>
      </div>
    </Layout>
  );
} 