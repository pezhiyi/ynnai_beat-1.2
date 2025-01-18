import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navbar() {
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
      </div>
    </motion.nav>
  );
}
