import Link from 'next/link';
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
          <span className="ynn">Ynn</span>
        </Link>
      </div>
    </motion.nav>
  );
}
