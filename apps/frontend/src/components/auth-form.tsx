'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth.context';
import { ThemeToggle } from '@/components/theme-toggle';
import styles from './auth-form.module.css';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { user, loading, login, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result =
      mode === 'signup' ? await signup(name, email, password) : await login(email, password);

    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return null;
  }

  return (
    <main className={styles.container}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logoMark}>AI</span>
          <span>Discovery</span>
        </Link>

        <h1 className={styles.title}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        <p className={styles.subtitle}>
          {mode === 'signup'
            ? 'Sign up to read and post on AI Discovery.'
            : 'Log in to continue to AI Discovery.'}
        </p>

        <form onSubmit={submit} className={styles.form}>
          {mode === 'signup' && (
            <label className={styles.field}>
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </label>
          )}

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === 'signup' ? (
            <>
              Already have an account? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
