import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Layout>
      <div className="error-container">
        <motion.div 
          className="error-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>404</h1>
          <p>页面未找到</p>
          <Link href="/">
            <motion.a 
              className="back-home"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              返回首页
            </motion.a>
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
          padding: 2rem;
        }

        .error-content {
          text-align: center;
        }

        h1 {
          font-size: 8rem;
          color: var(--primary-color);
          margin: 0;
          line-height: 1;
        }

        p {
          font-size: 1.5rem;
          color: var(--text-color);
          margin: 1rem 0 2rem;
        }

        .back-home {
          display: inline-block;
          padding: 0.8rem 1.6rem;
          background: var(--primary-color);
          color: white;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-home:hover {
          background: var(--primary-color-dark);
        }
      `}</style>
    </Layout>
  );
} 