#!/bin/bash

# Frontend Setup Script - Dark Mode + Admin Dashboard
# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎨 AI Discovery Frontend Setup Script${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if we're in the right directory
if [ ! -f "apps/frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this from the project root directory${NC}"
    echo -e "${RED}   Current: $(pwd)${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Step 1: Creating Directories${NC}"
mkdir -p apps/frontend/src/context
mkdir -p apps/frontend/src/components
mkdir -p apps/frontend/src/app/admin
echo -e "${GREEN}✅ Directories created${NC}\n"

echo -e "${YELLOW}🌓 Step 2: Creating Theme Context${NC}"
cat > apps/frontend/src/context/theme.context.tsx << 'THEME_CONTEXT'
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
THEME_CONTEXT
echo -e "${GREEN}✅ Theme context created${NC}\n"

echo -e "${YELLOW}🔘 Step 3: Creating Theme Toggle Component${NC}"
cat > apps/frontend/src/components/theme-toggle.tsx << 'THEME_TOGGLE'
'use client';

import { useTheme } from '@/context/theme.context';
import styles from './theme-toggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label="Toggle dark mode"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className={styles.icon}>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
THEME_TOGGLE
echo -e "${GREEN}✅ Theme toggle component created${NC}\n"

echo -e "${YELLOW}🎯 Step 4: Creating Toggle Styles${NC}"
cat > apps/frontend/src/components/theme-toggle.module.css << 'TOGGLE_STYLES'
.toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--toggle-bg);
  border: 2px solid var(--toggle-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toggle:hover {
  transform: scale(1.1) rotate(20deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.toggle:active {
  transform: scale(0.95);
}

.icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.toggle:hover .icon {
  transform: rotate(-20deg) scale(1.2);
}
TOGGLE_STYLES
echo -e "${GREEN}✅ Toggle styles created${NC}\n"

echo -e "${YELLOW}📊 Step 5: Creating Admin Dashboard Page${NC}"
cat > apps/frontend/src/app/admin/page.tsx << 'ADMIN_PAGE'
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './admin.module.css';

interface Document {
  id: string;
  title: string;
  author: string;
  tags: string[];
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

interface Analytics {
  totalDocuments: number;
  activeDocuments: number;
  inactiveDocuments: number;
  mostViewed: Document[];
  recentlyAdded: Document[];
}

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [docsResponse, analyticsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/admin/documents?page=${page}&limit=10`),
        axios.get('http://localhost:3001/api/admin/analytics'),
      ]);

      if (docsResponse.data.success) {
        setDocuments(docsResponse.data.data.data);
        setTotalPages(docsResponse.data.data.totalPages);
      }

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/admin/search?q=${encodeURIComponent(searchQuery)}`,
      );

      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await axios.delete(`http://localhost:3001/api/admin/documents/${id}`);
      if (response.data.success) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/admin/documents/${id}/toggle`,
      );

      if (response.data.success) {
        setDocuments(
          documents.map(doc =>
            doc.id === id ? { ...doc, isActive: response.data.data.isActive } : doc,
          ),
        );
      }
    } catch (err) {
      setError('Failed to toggle document status');
    }
  };

  if (loading && !analytics) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back to Search
      </Link>

      <h1 className={styles.title}>📊 Admin Dashboard</h1>

      {error && <div className={styles.error}>{error}</div>}

      {analytics && (
        <div className={styles.analyticsGrid}>
          <div className={styles.card}>
            <h3>Total Documents</h3>
            <p className={styles.number}>{analytics.totalDocuments}</p>
          </div>
          <div className={styles.card}>
            <h3>Active</h3>
            <p className={styles.number}>{analytics.activeDocuments}</p>
          </div>
          <div className={styles.card}>
            <h3>Inactive</h3>
            <p className={styles.number}>{analytics.inactiveDocuments}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPage(1);
              fetchData();
            }}
            className={styles.clearButton}
          >
            Clear
          </button>
        )}
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Tags</th>
              <th>Views</th>
              <th>Status</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className={!doc.isActive ? styles.inactive : ''}>
                <td className={styles.title}>{doc.title}</td>
                <td>{doc.author}</td>
                <td className={styles.tags}>
                  {doc.tags?.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </td>
                <td className={styles.views}>{doc.viewCount}</td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(doc.id)}
                    className={`${styles.statusButton} ${doc.isActive ? styles.active : styles.inactive}`}
                  >
                    {doc.isActive ? '✓ Active' : '✗ Inactive'}
                  </button>
                </td>
                <td className={styles.date}>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.actions}>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className={styles.deleteButton}
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {documents.length === 0 && (
          <div className={styles.noData}>No documents found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.pageButton}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.pageButton}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
ADMIN_PAGE
echo -e "${GREEN}✅ Admin dashboard page created${NC}\n"

echo -e "${YELLOW}🎨 Step 6: Creating Admin Dashboard Styles${NC}"
cat > apps/frontend/src/app/admin/admin.module.css << 'ADMIN_STYLES'
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.backLink {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--link-bg);
}

.backLink:hover {
  transform: translateX(-5px);
  background: var(--link-hover-bg);
}

.title {
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: var(--text-primary);
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid var(--error-color);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.analyticsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-hover-shadow);
  border-color: var(--primary-color);
}

.card h3 {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.searchForm {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  animation: slideUp 0.5s ease-out 0.1s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.searchInput {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.searchInput:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
}

.searchButton {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.searchButton:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.clearButton {
  padding: 12px 16px;
  background: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clearButton:hover {
  background: var(--secondary-hover-bg);
  border-color: var(--primary-color);
}

.tableContainer {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  margin-bottom: 30px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.table thead {
  background: var(--table-header-bg);
  border-bottom: 2px solid var(--border-color);
}

.table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.table tbody tr:hover {
  background: var(--table-row-hover);
}

.table tbody tr.inactive {
  opacity: 0.6;
}

.table td {
  padding: 14px 16px;
  color: var(--text-primary);
}

.table .title {
  font-weight: 600;
  color: var(--primary-color);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  display: inline-block;
  background: var(--tag-bg);
  color: var(--tag-text);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.views {
  text-align: center;
  font-weight: 600;
  color: var(--primary-color);
}

.date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.statusButton {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.statusButton.active {
  background: var(--success-bg);
  color: var(--success-text);
}

.statusButton.inactive {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.statusButton:hover {
  transform: scale(1.05);
}

.actions {
  text-align: center;
}

.deleteButton {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.deleteButton:hover {
  background: var(--danger-bg);
  transform: scale(1.2) rotate(-10deg);
}

.noData {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.pageInfo {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 120px;
  text-align: center;
}

.pageButton {
  padding: 10px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pageButton:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.pageButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.1rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .container {
    padding: 20px 15px;
  }

  .title {
    font-size: 1.8rem;
  }

  .analyticsGrid {
    grid-template-columns: 1fr;
  }

  .searchForm {
    flex-wrap: wrap;
  }

  .table {
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 10px 8px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
ADMIN_STYLES
echo -e "${GREEN}✅ Admin dashboard styles created${NC}\n"

echo -e "${YELLOW}🌈 Step 7: Updating Global Styles with Dark Mode${NC}"
cat > apps/frontend/src/app/globals.css << 'GLOBAL_STYLES'
/* Light Theme (default) */
:root[data-theme='light'] {
  --primary-color: #667eea;
  --primary-dark: #5568d3;
  --primary-color-alpha: rgba(102, 126, 234, 0.1);

  --text-primary: #1a1a1a;
  --text-secondary: #666666;

  --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-secondary: #ffffff;

  --card-bg: #ffffff;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --card-hover-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);

  --border-color: #e0e0e0;
  --input-bg: #f9f9f9;
  --input-border: #ddd;

  --link-bg: rgba(102, 126, 234, 0.05);
  --link-hover-bg: rgba(102, 126, 234, 0.1);

  --table-header-bg: #f5f7ff;
  --table-row-hover: #f9f9ff;

  --tag-bg: #e3f2fd;
  --tag-text: #1976d2;

  --toggle-bg: #fff;
  --toggle-border: #ddd;

  --error-bg: #ffebee;
  --error-text: #c62828;
  --error-color: #f44336;

  --success-bg: #e8f5e9;
  --success-text: #2e7d32;

  --warning-bg: #fff3e0;
  --warning-text: #e65100;

  --danger-bg: rgba(244, 67, 54, 0.1);

  --secondary-bg: #f5f5f5;
  --secondary-hover-bg: #ebebeb;
}

/* Dark Theme */
:root[data-theme='dark'] {
  --primary-color: #7c9ef5;
  --primary-dark: #6a8ee8;
  --primary-color-alpha: rgba(124, 158, 245, 0.1);

  --text-primary: #e4e4e7;
  --text-secondary: #a1a1a1;

  --bg-primary: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  --bg-secondary: #1a1a2e;

  --card-bg: #252545;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  --card-hover-shadow: 0 8px 32px rgba(124, 158, 245, 0.2);

  --border-color: #3a3a5c;
  --input-bg: #2a2a4a;
  --input-border: #404060;

  --link-bg: rgba(124, 158, 245, 0.1);
  --link-hover-bg: rgba(124, 158, 245, 0.15);

  --table-header-bg: #2a2a4a;
  --table-row-hover: #2f2f4f;

  --tag-bg: #3a4a7a;
  --tag-text: #7c9ef5;

  --toggle-bg: #2a2a4a;
  --toggle-border: #404060;

  --error-bg: #3a2a2a;
  --error-text: #ff8a8a;
  --error-color: #ff6b6b;

  --success-bg: #2a3a2a;
  --success-text: #90ee90;

  --warning-bg: #3a3a2a;
  --warning-text: #ffcc80;

  --danger-bg: rgba(255, 107, 107, 0.1);

  --secondary-bg: #3a3a5c;
  --secondary-hover-bg: #4a4a6c;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
  transition: background 0.3s ease, color 0.3s ease;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.3s ease;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

button {
  font-family: inherit;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

input,
textarea,
select {
  font-family: inherit;
  background: var(--input-bg);
  color: var(--text-primary);
  border: 1px solid var(--input-border);
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha);
}

::selection {
  background: var(--primary-color);
  color: white;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 5px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  body {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
GLOBAL_STYLES
echo -e "${GREEN}✅ Global styles with dark mode updated${NC}\n"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Frontend Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "1. ${BLUE}Update layout.tsx:${NC}"
echo -e "   Replace content of: ${BLUE}apps/frontend/src/app/layout.tsx${NC}\n"

echo -e "   ${BLUE}With this:${NC}"
cat << 'LAYOUT_CONTENT'
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme.context';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Content Discovery',
  description: 'Discover and search content with AI-powered semantic search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
LAYOUT_CONTENT

echo -e "\n2. ${BLUE}Update main page.tsx:${NC}"
echo -e "   Add this import at the top:${NC}"
echo -e "   ${BLUE}import { ThemeToggle } from '@/components/theme-toggle';${NC}\n"
echo -e "   Then add this inside the <main> component (after opening tag):${NC}"
echo -e "   ${BLUE}<ThemeToggle />${NC}\n"

echo -e "3. ${BLUE}Install dependencies:${NC}"
echo -e "   ${BLUE}cd apps/frontend${NC}"
echo -e "   ${BLUE}npm install${NC}\n"

echo -e "4. ${BLUE}Start frontend:${NC}"
echo -e "   ${BLUE}npm run dev${NC}\n"

echo -e "${GREEN}🚀 All done! Your frontend is ready!${NC}\n"
