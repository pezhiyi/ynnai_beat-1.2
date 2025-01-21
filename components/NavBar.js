import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/modules/components/NavBar.module.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { title: 'AI设计', path: '/draw' },
    { title: '灵感社区', path: '/community' },
    { title: '商品定制', path: '/products' },
    { title: '订单管理', path: '/orders' },
  ];

  return (
    <nav className={styles.navbar}>
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

        {isMobile ? (
          <>
            <button 
              className={styles.menuButton} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`${styles.menuIcon} ${isMenuOpen ? styles.open : ''}`}></span>
            </button>
            
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <Link 
                href="/login" 
                className={styles.loginButton}
                onClick={() => setIsMenuOpen(false)}
              >
                登录
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.desktopMenu}>
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={styles.menuItem}
              >
                {item.title}
              </Link>
            ))}
            <Link href="/login" className={styles.loginButton}>
              登录
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
