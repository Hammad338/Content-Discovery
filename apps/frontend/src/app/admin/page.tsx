'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/context/auth.context';
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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

function AdminDashboardContent() {
  const { user: currentUser, token } = useAuth();
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [tab, setTab] = useState<'documents' | 'users'>('documents');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userStats, setUserStats] = useState<{ total: number; admins: number } | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [docsResponse, analyticsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/admin/documents?page=${page}&limit=10`, authHeaders),
        axios.get('http://localhost:3001/api/admin/analytics', authHeaders),
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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');

      const response = await axios.get('http://localhost:3001/api/admin/users', authHeaders);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setUserStats({ total: response.data.data.total, admins: response.data.data.admins });
      } else {
        setUsersError(response.data.error || 'Failed to load users');
      }
    } catch (err) {
      setUsersError('Failed to load users');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/admin/search?q=${encodeURIComponent(searchQuery)}`,
        authHeaders,
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
      const response = await axios.delete(`http://localhost:3001/api/admin/documents/${id}`, authHeaders);
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
        {},
        authHeaders,
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

  const handleToggleRole = async (targetUser: AdminUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${targetUser.name}'s role to ${nextRole}?`)) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/admin/users/${targetUser.id}/role`,
        { role: nextRole },
        authHeaders,
      );
      if (response.data.success) {
        setUsers(users.map(u => (u.id === targetUser.id ? { ...u, role: nextRole } : u)));
        setUserStats(prev =>
          prev ? { ...prev, admins: prev.admins + (nextRole === 'admin' ? 1 : -1) } : prev,
        );
      } else {
        setUsersError(response.data.error || 'Failed to update role');
      }
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (!confirm(`Delete ${targetUser.name}'s account? This can't be undone.`)) return;

    try {
      const response = await axios.delete(`http://localhost:3001/api/admin/users/${targetUser.id}`, authHeaders);
      if (response.data.success) {
        setUsers(users.filter(u => u.id !== targetUser.id));
        setUserStats(prev =>
          prev
            ? { total: prev.total - 1, admins: prev.admins - (targetUser.role === 'admin' ? 1 : 0) }
            : prev,
        );
      } else {
        setUsersError(response.data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.backLink}>
          ← Back to Feed
        </Link>
        <div className={styles.navActions}>
          <ThemeToggle />
          <NavMenu />
        </div>
      </nav>

      <div className={styles.container}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {loading && !analytics && <div className={styles.loading}>Loading dashboard...</div>}

        {error && <div className={styles.error}>{error}</div>}

        {(analytics || userStats) && (
          <div className={styles.analyticsGrid}>
            {analytics && (
              <>
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
              </>
            )}
            {userStats && (
              <>
                <div className={styles.card}>
                  <h3>Signed-Up Users</h3>
                  <p className={styles.number}>{userStats.total}</p>
                </div>
                <div className={styles.card}>
                  <h3>Admins</h3>
                  <p className={styles.number}>{userStats.admins}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'documents' ? styles.tabActive : styles.tab}
            onClick={() => setTab('documents')}
          >
            Documents
          </button>
          <button
            type="button"
            className={tab === 'users' ? styles.tabActive : styles.tab}
            onClick={() => setTab('users')}
          >
            Users
          </button>
        </div>

        {tab === 'documents' && (
          <>
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
          </>
        )}

        {tab === 'users' && (
          <>
            {usersError && <div className={styles.error}>{usersError}</div>}

            {usersLoading && users.length === 0 ? (
              <div className={styles.loading}>Loading users...</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isSelf = u.id === currentUser?.id;
                      return (
                        <tr key={u.id}>
                          <td className={styles.title}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <button
                              onClick={() => handleToggleRole(u)}
                              disabled={isSelf}
                              title={isSelf ? "You can't change your own role" : undefined}
                              className={`${styles.statusButton} ${u.role === 'admin' ? styles.active : styles.inactive}`}
                            >
                              {u.role === 'admin' ? '✓ Admin' : 'User'}
                            </button>
                          </td>
                          <td className={styles.date}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className={styles.actions}>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              className={styles.deleteButton}
                              title={isSelf ? "You can't delete your own account" : 'Delete user'}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {users.length === 0 && <div className={styles.noData}>No users found</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
