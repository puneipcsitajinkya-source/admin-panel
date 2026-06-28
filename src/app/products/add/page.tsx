'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getCategories } from '@/services/api';
import Toast from '@/components/Toast';

interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    nameEn: '',
    nameMr: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data);
        if (res.data && res.data.length > 0) {
          setForm((prev) => ({ ...prev, category: res.data[0].name }));
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn || !form.nameMr || !form.price) {
      setToast({ message: 'English/Marathi Names and Price are required', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await createProduct({
        name: {
          en: form.nameEn,
          mr: form.nameMr,
        },
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image || undefined,
      });
      setToast({ message: 'Product added successfully!', type: 'success' });
      setTimeout(() => router.push('/products'), 1000);
    } catch {
      setToast({ message: 'Failed to add product', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Add Product</div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back</button>
      </div>
      <div className="page-content">
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header">
            <div className="card-title">📦 New Product</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Product Name (English) *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Fresh Tomatoes"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name (Marathi) *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. ताजे टोमॅटो"
                    value={form.nameMr}
                    onChange={(e) => setForm({ ...form, nameMr: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Short description of the product..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 40"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.icon || '🏷️'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                {form.image && (
                  <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img
                      src={form.image}
                      alt="preview"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  💡 Paste any public image URL. Try{' '}
                  <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                    Unsplash.com
                  </a>{' '}
                  for free product images.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Saving...' : '✅ Save Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
