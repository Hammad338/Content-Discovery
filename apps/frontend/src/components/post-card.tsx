import Link from 'next/link';
import { PostActions } from './post-actions';
import styles from './post-card.module.css';

export interface PostCardData {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

const AVATAR_COLORS = ['#4f5fd1', '#a34ac9', '#2e93a8', '#3f9a5c', '#c2506b', '#b07f2e'];

const CATEGORY_COLORS = [
  '#a8324a', // deep rose
  '#2e6b52', // forest green
  '#3f5aa8', // slate blue
  '#a8641f', // amber brown
  '#5f4ea3', // violet
  '#1f7a8c', // teal
  '#8c3f8c', // plum
];

export function hashString(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export function avatarColor(seed: string) {
  return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
}

export function categoryColor(tag: string) {
  return CATEGORY_COLORS[hashString(tag) % CATEGORY_COLORS.length];
}

export function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function categoryLabel(tag?: string) {
  if (!tag) return null;
  return tag.replace(/-/g, ' ');
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function readTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  const isDiscussion = post.metadata?.type === 'discussion';
  const title = post.metadata?.title;
  const author = post.metadata?.author || 'Unknown';
  const role = post.metadata?.role;
  const date = post.metadata?.date || post.createdAt;
  const tags: string[] = post.metadata?.tags || [];
  const externalUrl = post.metadata?.url as string | undefined;
  const domain = externalUrl ? domainOf(externalUrl) : null;
  const accent = tags[0] ? categoryColor(tags[0]) : null;

  const href = externalUrl || `/source/${post.id}`;
  const linkProps = externalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  const shareUrl =
    externalUrl ||
    (typeof window !== 'undefined' ? `${window.location.origin}/source/${post.id}` : `/source/${post.id}`);

  return (
    <div
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      style={!isDiscussion && accent ? { borderTopColor: accent } : undefined}
    >
      <Link href={href} {...linkProps} className={styles.clickArea}>
        <div className={styles.header}>
          <div className={styles.avatar} style={{ background: avatarColor(author) }}>
            {initials(author)}
          </div>
          <div className={styles.headerText}>
            <span className={styles.author}>
              {author}
              {role && <span className={styles.role}> · {role}</span>}
            </span>
            <span className={styles.date}>
              {date && new Date(date).toLocaleDateString()}
              {!isDiscussion && ` · ${readTime(post.content)} min read`}
            </span>
          </div>
        </div>

        {!isDiscussion && tags[0] && (
          <span className={styles.eyebrow} style={accent ? { color: accent } : undefined}>
            {categoryLabel(tags[0])}
          </span>
        )}

        {title && <h3 className={featured ? styles.featuredTitle : styles.title}>{title}</h3>}
        <p className={isDiscussion ? styles.discussionText : styles.excerpt}>
          {post.content.length > 220 ? `${post.content.substring(0, 220)}...` : post.content}
        </p>

        {domain && <span className={styles.sourceBadge}>{domain} ↗</span>}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <PostActions
        postId={post.id}
        title={title || `${author}'s post`}
        shareUrl={shareUrl}
        commentHref={`/source/${post.id}`}
      />
    </div>
  );
}
