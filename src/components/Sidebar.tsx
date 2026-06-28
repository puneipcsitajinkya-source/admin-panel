'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/products', label: 'Products', icon: '🛒' },
  { href: '/products/add', label: 'Add Product', icon: '➕' },
  { href: '/categories', label: 'Categories', icon: '🏷️' },
  { href: '/orders', label: 'Orders', icon: '📦' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove('sidebar-active');
  }, [pathname]);

  return (
    <>
      {/* Floating Hamburger button on mobile */}
      <button
        className="mobile-nav-toggle"
        onClick={() => document.documentElement.classList.add('sidebar-active')}
        aria-label="Toggle Navigation"
      >
        ☰
      </button>

      {/* Backdrop overlay on mobile */}
      <div
        className="sidebar-backdrop"
        onClick={() => document.documentElement.classList.remove('sidebar-active')}
      />

      <aside className="sidebar">
        {/* Mobile close button top-right in sidebar */}
        <button
          className="sidebar-close"
          onClick={() => document.documentElement.classList.remove('sidebar-active')}
          aria-label="Close Sidebar"
        >
          ✕
        </button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛍️</div>
          <div className="sidebar-logo-text">
            First<span>Mart</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          FirstMart Admin v1.0
        </div>
      </aside>
    </>
  );
}
