'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const PHOTOGRAPHER_NAME =
  process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'BVK.CINE';

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
          {/* Logo — chromatic aberration on the dot only */}
          <a
            href="/"
            className="text-[15px] font-semibold tracking-tight text-white hover:opacity-70 transition-opacity"
          >
            {PHOTOGRAPHER_NAME.toUpperCase()}
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-white/50 hover:text-white transition-colors duration-200 tracking-wide uppercase"
                style={{ letterSpacing: '0.06em' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-white/70"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'rgba(8,9,16,0.88)',
            backdropFilter: 'blur(48px) saturate(180%)',
            WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          }}
        >
          <div className="flex items-center justify-between px-6 h-14" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-[15px] font-semibold text-white tracking-tight chromatic-sm">
              {PHOTOGRAPHER_NAME.toUpperCase()}
            </span>
            <button
              className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-12">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-5xl font-extralight text-white tracking-tight hover:opacity-40 transition-opacity"
                style={{ animationDelay: `${i * 60}ms` }}
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
