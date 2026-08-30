'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './post-actions.module.css';

interface PostActionsProps {
  postId: string;
  title: string;
  shareUrl: string;
  commentHref?: string;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function PostActions({ postId, title, shareUrl, commentHref }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareLabel, setShareLabel] = useState('Share');

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`liked:${postId}`) === '1');
      setLikeCount(Number(localStorage.getItem(`likeCount:${postId}`) || 0));
    } catch {
      // localStorage unavailable — keep defaults
    }
  }, [postId]);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    const nextCount = Math.max(0, likeCount + (next ? 1 : -1));
    setLiked(next);
    setLikeCount(nextCount);
    try {
      localStorage.setItem(`liked:${postId}`, next ? '1' : '0');
      localStorage.setItem(`likeCount:${postId}`, String(nextCount));
    } catch {
      // ignore write failures (private browsing, etc.)
    }
  };

  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareLabel('Copied');
      setTimeout(() => setShareLabel('Share'), 1500);
    } catch {
      // user cancelled the share sheet, or clipboard unavailable — no-op
    }
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.action} ${liked ? styles.liked : ''}`}
        onClick={toggleLike}
        aria-pressed={liked}
      >
        <HeartIcon filled={liked} />
        <span>{likeCount > 0 ? likeCount : 'Like'}</span>
      </button>

      {commentHref && (
        <Link href={commentHref} className={styles.action} onClick={(e) => e.stopPropagation()}>
          <CommentIcon />
          <span>Comment</span>
        </Link>
      )}

      <button type="button" className={styles.action} onClick={share}>
        <ShareIcon />
        <span>{shareLabel}</span>
      </button>
    </div>
  );
}
