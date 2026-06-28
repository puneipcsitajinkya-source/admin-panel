'use client';
import { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory, updateCategory } from '@/services/api';
import Toast from '@/components/Toast';

interface Category {
  _id: string;
  name: string;
  icon: string;
  showOnApp: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🏷️', showOnApp: true });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = () => {
    setLoading(true);
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error(err);
        setToast({ message: 'Failed to load categories', type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleShowOnApp = async (id: string, currentStatus: boolean) => {
    try {
      await updateCategory(id, { showOnApp: !currentStatus });
      setToast({ message: '✅ Category visibility updated!', type: 'success' });
      load();
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to update category visibility', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({ message: 'Category name is required', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await createCategory({ name: form.name.trim(), icon: form.icon, showOnApp: form.showOnApp });
      setToast({ message: '✅ Category added successfully!', type: 'success' });
      setForm({ name: '', icon: '🏷️', showOnApp: true });
      load();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to create category';
      setToast({ message: errMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      setToast({ message: `✅ Deleted category "${name}"`, type: 'success' });
      load();
    } catch {
      setToast({ message: 'Failed to delete category', type: 'error' });
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">🏷️ Categories</div>
      </div>

      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left Side: Create Category Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">➕ Add New Category</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Clothing"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icon / Emoji</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. 🏷️"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
                <input
                  type="checkbox"
                  id="showOnApp"
                  checked={form.showOnApp}
                  onChange={(e) => setForm({ ...form, showOnApp: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="showOnApp" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  Show on App
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={saving}>
                {saving ? 'Adding...' : '✅ Save Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Categories List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Existing Categories</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : categories.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No categories found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {categories.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{c.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {c._id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        onClick={() => handleToggleShowOnApp(c._id, c.showOnApp)}
                        style={{
                          fontSize: 12,
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: c.showOnApp ? '#f0fdf4' : '#fef2f2',
                          color: c.showOnApp ? '#166534' : '#991b1b',
                          border: `1px solid ${c.showOnApp ? '#bbf7d0' : '#fecaca'}`,
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {c.showOnApp ? '🟢 Visible on App' : '🔴 Hidden on App'}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c._id, c.name)}
                        style={{ padding: '6px 12px' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
