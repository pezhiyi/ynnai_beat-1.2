import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        AI Image Tool
      </Link>

      <button 
        className="menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="menu-icon" />
      </button>

      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link href="/draw">编辑图片</Link>
      </div>
    </nav>
  );
}
