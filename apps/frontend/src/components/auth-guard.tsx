'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth.context';
import styles from './auth-guard.module.css';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className={styles.wrap}>
        <div className={styles.denied}>
          <h1>Access denied</h1>
          <p>This page is only available to admin accounts.</p>
          <Link href="/">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
