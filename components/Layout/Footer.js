import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    >
      <div className="footer-content">
        <p>© 2024 Ynn_AI. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}
