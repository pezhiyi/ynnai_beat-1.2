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
      icon: <HiOutlinePencilAlt size={24} />,
      description: 'AI设计一站式工具',
      subItems: [
        { title: 'AI图像生成', path: '/draw/generate' },
        { title: '图像编辑', path: '/draw/edit' },
        { title: '批量处理', path: '/draw/batch' }
      ]
    },
    { 
      title: '灵感社区', 
      path: '/message',
      icon: <HiOutlineLightBulb size={24} />,
      description: '创意灵感使用技巧',
      subItems: [
        { title: '作品展示', path: '/message/showcase' },
        { title: '经验分享', path: '/message/experience' },
        { title: '技巧教程', path: '/message/tutorials' }
      ]
    },
    { 
      title: '商品定制', 
      path: '/products',
      icon: <HiOutlineShoppingBag size={24} />,
      description: '全品类智能供应链',
      subItems: [
        { title: '定制商品', path: '/products/custom' },
        { title: '模板市场', path: '/products/templates' },
        { title: '供应链对接', path: '/products/supply' }
      ]
    },
    { 
      title: '订单管理', 
      path: '/orders/orderManagement',
      icon: <HiOutlineClipboardList size={24} />,
      description: '商品定制订单跟踪',
      subItems: [
        { title: '订单列表', path: '/orders/list' },
        { title: '订单追踪', path: '/orders/tracking' },
        { title: '售后服务', path: '/orders/service' }
      ]
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
    <>
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
                      <span className={styles.iconWrapper}>
                        <HiOutlineUser size={24} />
                      </span>
                      <span>登录</span>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.desktopMenu}>
                {menuItems.map((item) => (
                  <div key={item.path} className={styles.menuItemContainer}>
                    <Link 
                      href={item.path}
                      className={styles.menuItem}
                    >
                      <span className={styles.iconWrapper}>{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                    {item.subItems && (
                      <div className={styles.dropdownMenu}>
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
                            className={styles.dropdownItem}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link 
                  href="#" 
                  className={styles.loginButton}
                  onClick={handleLoginClick}
                >
                  <span className={styles.iconWrapper}><HiOutlineUser size={24} /></span>
                  <span>登录</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* 将LoginModal移到导航栏外部 */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
