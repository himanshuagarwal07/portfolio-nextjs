'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar({ brandName }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const d = document.documentElement;
      const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
      setProgress(pct);
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function closeMobile() {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }

  function toggleMobile() {
    const next = !mobileOpen;
    setMobileOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  }

  const links = [
    { href: '#about', label: 'About' },
    { href: '#expertise', label: 'Expertise' },
    { href: '#work', label: 'Writing' },
    { href: '#process', label: 'Process' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <div id="progress" style={{ width: `${progress}%` }} />

      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-brand">{brandName}</a>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <button
          className={`hamburger${mobileOpen ? ' open' : ''}`}
          onClick={toggleMobile}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={closeMobile}>
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
