"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/dashboard/admin';
    if (user.role === 'Business') return '/dashboard/business';
    return '/dashboard/worker';
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'AI Employee', href: '/marketplace/agents' },
    { label: 'Human Employee', href: '/marketplace/workers' },
    { label: 'Review', href: '/reviews' },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="logo-mark">
            {/* Hexagon SVG icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="logo-wordmark">HIVE</span>
        </Link>

        {/* ── Desktop Nav Pills ── */}
        <nav className="nav-pills hidden md:flex">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={`nav-pill ${isActive(href) ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Auth Actions ── */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 text-sm font-bold"
                style={{ color: 'var(--fg-primary)', opacity: 0.75 }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 p-2 rounded-full cursor-pointer transition-colors hover:bg-black/5"
                style={{ color: 'var(--accent-red)' }}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold" style={{ color: 'var(--fg-muted)' }}>
                Login
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg-nav)',
          borderTop: '1px solid rgba(24,24,26,0.06)',
          padding: '1rem 2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem'
        }}>
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`nav-pill w-fit ${isActive(href) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(24,24,26,0.06)', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary text-sm" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }} onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
