'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'ALEX CHEN';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Work',    href: '#work' },
    { label: 'About',   href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-out ${
          scrolled ? 'glass-nav-dark' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="font-semibold tracking-tight text-[15px] text-white hover:opacity-70 transition-opacity"
          >
            {PHOTOGRAPHER_NAME}
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14px] text-white/60 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-white"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay — liquid glass */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col animate-fade-in"
          style={{
            background: 'rgba(10,10,20,0.85)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
            <span className="font-semibold tracking-tight text-[15px] text-white">
              {PHOTOGRAPHER_NAME}
            </span>
            <button
              className="p-2 -mr-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-4xl font-light text-white tracking-tight hover:opacity-50 transition-opacity chromatic-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
