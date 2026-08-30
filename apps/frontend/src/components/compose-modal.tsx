'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './compose-modal.module.css';

interface ComposeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AUTHOR_STORAGE_KEY = 'composeAuthorName';
const ROLE_STORAGE_KEY = 'composeAuthorRole';

export function ComposeModal({ onClose, onCreated }: ComposeModalProps) {
  const [type, setType] = useState<'article' | 'discussion'>('discussion');
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      setAuthor(localStorage.getItem(AUTHOR_STORAGE_KEY) || '');
      setRole(localStorage.getItem(ROLE_STORAGE_KEY) || '');
    } catch {
      // ignore
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!author.trim()) {
      setError('Your name is required.');
      return;
    }
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }
    if (type === 'article' && !title.trim()) {
      setError('Articles need a title.');
      return;
    }

    setSubmitting(true);
    try {
      const metadata: Record<string, any> = {
        author: author.trim(),
        type,
        tags: tags
          .split(',')
          .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
          .filter(Boolean),
        date: new Date().toISOString().slice(0, 10),
      };
      if (role.trim()) metadata.role = role.trim();
      if (type === 'article') metadata.title = title.trim();
      if (url.trim()) metadata.url = url.trim();

      const response = await axios.post('http://localhost:3001/api/rag/documents', {
        content: content.trim(),
        metadata,
      });

      if (!response.data.success) {
        setError(response.data.error || 'Failed to publish post');
        return;
      }

      try {
        localStorage.setItem(AUTHOR_STORAGE_KEY, author.trim());
        localStorage.setItem(ROLE_STORAGE_KEY, role.trim());
      } catch {
        // ignore
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to backend');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>New Post</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.typeToggle}>
          <button
            type="button"
            className={type === 'discussion' ? styles.typeActive : styles.type}
            onClick={() => setType('discussion')}
          >
            Discussion
          </button>
          <button
            type="button"
            className={type === 'article' ? styles.typeActive : styles.type}
            onClick={() => setType('article')}
          >
            Article
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Your name *</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jane Doe" />
            </label>
            <label className={styles.field}>
              <span>Role (optional)</span>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="ML Engineer" />
            </label>
          </div>

          {type === 'article' && (
            <label className={styles.field}>
              <span>Title *</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
            </label>
          )}

          <label className={styles.field}>
            <span>{type === 'article' ? 'Body *' : 'What\'s on your mind? *'}</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={type === 'article' ? 6 : 3}
              placeholder={
                type === 'article'
                  ? 'Write the full article...'
                  : 'Share a take, an update, a question...'
              }
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Tags (comma separated)</span>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, robotics" />
            </label>
            {type === 'article' && (
              <label className={styles.field}>
                <span>Source URL (optional)</span>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </label>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
}
