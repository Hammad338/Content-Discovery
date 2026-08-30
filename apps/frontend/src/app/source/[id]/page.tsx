'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { PostActions } from '@/components/post-actions';
import styles from './source.module.css';

interface Source {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export default function SourcePage() {
  const params = useParams();
  const id = params?.id as string;

  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchSource = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`http://localhost:3001/api/rag/documents/${id}`);
        if (response.data.success) {
          setSource(response.data.data);
        } else {
          setError(response.data.error || 'Source not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load source');
      } finally {
        setLoading(false);
      }
    };

    fetchSource();
  }, [id]);

  return (
    <main className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.backLink}>
          ← Back to Feed
        </Link>
        <div className={styles.navActions}>
          <ThemeToggle />
          <NavMenu />
        </div>
      </nav>

      <div className={styles.content}>
        {loading && <div className={styles.status}>Loading source...</div>}

        {!loading && error && (
          <div className={styles.error}>
            <strong>Couldn't load this source.</strong>
            <p>{error}</p>
            <Link href="/" className={styles.backLink}>
              ← Back to Feed
            </Link>
          </div>
        )}

        {!loading && !error && source && (
          <article className={styles.article}>
            {source.metadata?.title && <h1 className={styles.title}>{source.metadata.title}</h1>}
            <div className={styles.meta}>
              {source.metadata?.author && (
                <span>
                  By {source.metadata.author}
                  {source.metadata?.role && ` · ${source.metadata.role}`}
                </span>
              )}
              {source.metadata?.date && <span>{source.metadata.date}</span>}
            </div>
            <p className={styles.body}>{source.content}</p>
            {source.metadata?.url && (
              <a
                href={source.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.originalLink}
              >
                View Original Source ↗
              </a>
            )}
            {(source.metadata?.tags?.length ?? 0) > 0 && (
              <div className={styles.tags}>
                {source.metadata?.tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <PostActions
              postId={source.id}
              title={source.metadata?.title || `${source.metadata?.author || 'A'}'s post`}
              shareUrl={source.metadata?.url || (typeof window !== 'undefined' ? window.location.href : '')}
            />
          </article>
        )}
      </div>
    </main>
  );
}
