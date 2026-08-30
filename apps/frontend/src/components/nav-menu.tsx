'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import styles from './nav-menu.module.css';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.replace('/login');
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {user && (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <div className={styles.divider} />
            </>
          )}

          <Link href="/" className={styles.item} onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/admin" className={styles.item} onClick={() => setOpen(false)}>
            Admin Dashboard
          </Link>
          <div className={styles.divider} />
          <a
            href="mailto:Hammadalam3381@gmail.com"
            className={styles.item}
            onClick={() => setOpen(false)}
          >
            Contact
          </a>
          <a
            href="https://www.linkedin.com/in/hammad-alam-a509b4a0/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.item}
            onClick={() => setOpen(false)}
          >
            LinkedIn
          </a>

          {user && (
            <>
              <div className={styles.divider} />
              <button type="button" className={styles.item} onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
