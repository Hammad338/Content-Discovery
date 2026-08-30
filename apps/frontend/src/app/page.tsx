'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { PostCard, PostCardData } from '@/components/post-card';
import { Sidebar } from '@/components/sidebar';
import { ComposeModal } from '@/components/compose-modal';
import { categoryLabel } from '@/components/post-card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './page.module.css';

interface SearchResult {
  query: string;
  answer: string;
  sources: PostCardData[];
  timestamp: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [stats, setStats] = useState<{ totalDocuments: number; ready: boolean } | null>(null);

  const [feed, setFeed] = useState<PostCardData[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/rag/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchFeed = async () => {
    try {
      setFeedLoading(true);
      setFeedError('');
      const response = await axios.get('http://localhost:3001/api/rag/documents?limit=40');
      if (response.data.success) {
        setFeed(response.data.data);
      } else {
        setFeedError(response.data.error || 'Failed to load feed');
      }
    } catch (err: any) {
      setFeedError(err.response?.data?.error || 'Failed to connect to backend');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFeed();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3001/api/rag/search', {
        query,
      });

      if (response.data.success) {
        setResults(response.data.data);
        fetchStats();
      } else {
        setSearchError(response.data.error || 'Search failed');
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.error || 'Failed to connect to backend');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setResults(null);
    setSearchError('');
    setQuery('');
  };

  const hasTag = (post: PostCardData, tag: string) =>
    ((post.metadata?.tags || []) as string[]).includes(tag);

  const allArticles = feed.filter(post => (post.metadata?.type || 'article') !== 'discussion');
  const allDiscussions = feed.filter(post => post.metadata?.type === 'discussion');

  const articles = categoryFilter ? allArticles.filter(post => hasTag(post, categoryFilter)) : allArticles;
  const discussions = categoryFilter
    ? allDiscussions.filter(post => hasTag(post, categoryFilter))
    : allDiscussions;

  const featuredArticle = categoryFilter ? null : articles[0];
  const restArticles = categoryFilter ? articles : articles.slice(1);

  return (
    <main className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/" onClick={clearSearch} className={styles.brand}>
          <span className={styles.logoMark}>AI</span>
          <span>Discovery</span>
        </Link>

        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI & tech topics..."
            className={styles.searchInput}
            disabled={searchLoading}
          />
          <button type="submit" className={styles.searchButton} disabled={searchLoading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className={styles.navActions}>
          <button type="button" className={styles.newPostButton} onClick={() => setComposeOpen(true)}>
            New Post
          </button>
          <ThemeToggle />
          <NavMenu />
        </div>
      </nav>

      <div className={styles.content}>
        {results ? (
          <div className={styles.searchView}>
            <button type="button" className={styles.backToFeed} onClick={clearSearch}>
              ← Back to Feed
            </button>

            <h1 className={styles.searchTitle}>Results for "{results.query}"</h1>

            <div className={styles.answerCard}>
              <h2>Summary</h2>
              <p>{results.answer}</p>
            </div>

            {results.sources.length > 0 ? (
              <div className={styles.feedGrid}>
                {results.sources.map(source => (
                  <PostCard key={source.id} post={source} />
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No matching sources found.</p>
            )}

            <p className={styles.searchedAt}>
              Searched at {new Date(results.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.hero}>
              <h1 className={styles.heroTitle}>Latest AI &amp; Tech Trends</h1>
              <p className={styles.heroSubtitle}>
                Reporting and analysis on machine learning, robotics, and the research shaping AI —
                plus perspectives from the people building it.
              </p>
              {stats && (
                <span className={styles.statBadge}>
                  {stats.ready
                    ? `${stats.totalDocuments} document${stats.totalDocuments === 1 ? '' : 's'} indexed`
                    : 'No documents indexed yet'}
                </span>
              )}
            </div>

            {searchError && (
              <div className={styles.error}>
                <strong>Error:</strong> {searchError}
              </div>
            )}

            {feedLoading && <div className={styles.emptyState}>Loading feed...</div>}

            {!feedLoading && feedError && (
              <div className={styles.error}>
                <strong>Error:</strong> {feedError}
              </div>
            )}

            {!feedLoading && !feedError && feed.length === 0 && (
              <div className={styles.emptyState}>
                No documents yet — ingest content via <code>/api/rag/ingest</code> to populate the
                feed.
              </div>
            )}

            {feed.length > 0 && (
              <div className={styles.layout}>
                <div className={styles.main}>
                  {categoryFilter && (
                    <div className={styles.filterBanner}>
                      Filtered by <strong>{categoryLabel(categoryFilter)}</strong>
                      <button type="button" onClick={() => setCategoryFilter(null)}>
                        Clear
                      </button>
                    </div>
                  )}

                  {featuredArticle && (
                    <section className={styles.section}>
                      <PostCard post={featuredArticle} featured />
                    </section>
                  )}

                  {restArticles.length > 0 && (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>
                        {categoryFilter ? 'Articles' : 'Latest Trends'}
                      </h2>
                      <div className={styles.feedGrid}>
                        {restArticles.map(post => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </section>
                  )}

                  {discussions.length > 0 && (
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Community Discussions</h2>
                      <p className={styles.sectionSubtitle}>
                        Short takes and debates from contributors across the field
                      </p>
                      <div className={styles.discussionList}>
                        {discussions.map(post => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </section>
                  )}

                  {categoryFilter && articles.length === 0 && discussions.length === 0 && (
                    <div className={styles.emptyState}>Nothing in this category yet.</div>
                  )}
                </div>

                <Sidebar
                  articles={allArticles}
                  allPosts={feed}
                  activeCategory={categoryFilter}
                  onSelectCategory={setCategoryFilter}
                />
              </div>
            )}
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brand}>
              <span className={styles.logoMark}>AI</span>
              <span>Discovery</span>
            </span>
            <p>A demo publication on AI, machine learning, and the research shaping the field.</p>
          </div>

          <div className={styles.footerCol}>
            <h4>Navigate</h4>
            <Link href="/">Home</Link>
            <Link href="/admin">Admin Dashboard</Link>
          </div>

          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <a href="mailto:Hammadalam3381@gmail.com">Hammadalam3381@gmail.com</a>
            <a href="https://www.linkedin.com/in/hammad-alam-a509b4a0/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
        <p className={styles.footerNote}>Built with NestJS, Next.js, and Claude AI.</p>
      </footer>

      {composeOpen && (
        <ComposeModal
          onClose={() => setComposeOpen(false)}
          onCreated={() => {
            fetchFeed();
            fetchStats();
          }}
        />
      )}
    </main>
  );
}
