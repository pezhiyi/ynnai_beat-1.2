import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiOutlinePencilAlt, HiOutlineLightBulb, HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineUser } from 'react-icons/hi';
import styles from './Navbar.module.css';
import LoginModal from '../Auth/LoginModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { 
      title: 'YnnAI设计', 
      path: '/draw',
      icon: <HiOutlinePencilAlt size={20} />,
      description: 'AI设计一站式工具'
    },
    { 
      title: '灵感社区', 
      path: '/message',
      icon: <HiOutlineLightBulb size={20} />,
      description: '创意灵感使用技巧'
    },
    { 
      title: '商品定制', 
      path: '/products',
      icon: <HiOutlineShoppingBag size={20} />,
      description: '全品类智能供应链'
    },
    { 
      title: '订单管理', 
      path: '/orders',
      icon: <HiOutlineClipboardList size={20} />,
      description: '商品定制订单跟踪'
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          <div className="logo-wrapper">
            <Image
              src="/images/logo_all.png"
              alt="YNN Logo"
              width={86}
              height={29}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Link>

        <div className={styles.menuContainer}>
          {isMobile ? (
            <>
              <button 
                className={styles.menuButton} 
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span className={`${styles.menuIconBars} ${isMenuOpen ? styles.open : ''}`}></span>
              </button>
              
              {isMenuOpen && (
                <div className={styles.mobileMenu}>
                  {menuItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className={styles.mobileMenuItem}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className={styles.titleWrapper}>
                        <span className={styles.iconWrapper}>{item.icon}</span>
                        <span className={styles.title}>{item.title}</span>
                      </div>
                      <span className={styles.description}>{item.description}</span>
                    </Link>
                  ))}
                  <Link 
                    href="#" 
                    className={styles.loginButton}
                    onClick={handleLoginClick}
                  >
                    <span className={styles.iconWrapper}><HiOutlineUser size={20} /></span>
                    <span>登录</span>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className={styles.desktopMenu}>
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={styles.menuItem}
                >
                  <span className={styles.iconWrapper}>{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
              <Link 
                href="#" 
                className={styles.loginButton}
                onClick={handleLoginClick}
              >
                <span className={styles.iconWrapper}><HiOutlineUser size={20} /></span>
                <span>登录</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </motion.nav>
  );
}
