'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PostCardData, categoryColor, categoryLabel } from './post-card';
import styles from './sidebar.module.css';

interface SidebarProps {
  articles: PostCardData[];
  allPosts: PostCardData[];
  activeCategory: string | null;
  onSelectCategory: (tag: string | null) => void;
}

export function Sidebar({ articles, allPosts, activeCategory, onSelectCategory }: SidebarProps) {
  const headlines = articles.slice(0, 5);

  const categoryCounts = new Map<string, number>();
  allPosts.forEach(post => {
    const tags: string[] = post.metadata?.tags || [];
    tags.forEach(tag => categoryCounts.set(tag, (categoryCounts.get(tag) || 0) + 1));
  });
  const categories = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <aside className={styles.sidebar}>
      {headlines.length > 0 && (
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>Latest Headlines</h3>
          <ol className={styles.headlineList}>
            {headlines.map((post, i) => (
              <li key={post.id}>
                <Link href={`/source/${post.id}`} className={styles.headlineLink}>
                  <span className={styles.headlineIndex}>{i + 1}</span>
                  <span>{post.metadata?.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {categories.length > 0 && (
        <div className={styles.widget}>
          <div className={styles.categoryHeader}>
            <h3 className={styles.widgetTitle}>Categories</h3>
            {activeCategory && (
              <button
                type="button"
                className={styles.clearCategory}
                onClick={() => onSelectCategory(null)}
              >
                Clear
              </button>
            )}
          </div>
          <ul className={styles.categoryList}>
            {categories.map(([tag, count]) => (
              <li key={tag}>
                <button
                  type="button"
                  className={`${styles.categoryItem} ${activeCategory === tag ? styles.categoryItemActive : ''}`}
                  onClick={() => onSelectCategory(activeCategory === tag ? null : tag)}
                  aria-pressed={activeCategory === tag}
                >
                  <span className={styles.categoryDot} style={{ background: categoryColor(tag) }} />
                  <span className={styles.categoryName}>{categoryLabel(tag)}</span>
                  <span className={styles.categoryCount}>{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <NewsletterWidget />
      <AboutWidget />
    </aside>
  );
}

function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>Newsletter</h3>
      <p className={styles.widgetText}>Get the latest AI and tech trends in your inbox.</p>
      {submitted ? (
        <p className={styles.newsletterNote}>
          Thanks — noted. This is a demo project, so no email is actually sent.
        </p>
      ) : (
        <form onSubmit={onSubmit} className={styles.newsletterForm}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={styles.newsletterInput}
          />
          <button type="submit" className={styles.newsletterButton}>
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

function AboutWidget() {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>About</h3>
      <p className={styles.widgetText}>
        AI Discovery is a demo publication covering machine learning, robotics, and the research
        shaping AI — built as a showcase project by Hammad Alam.
      </p>
      <div className={styles.aboutLinks}>
        <a href="mailto:Hammadalam3381@gmail.com" className={styles.aboutLink}>
          Contact
        </a>
        <a
          href="https://www.linkedin.com/in/hammad-alam-a509b4a0/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.aboutLink}
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
