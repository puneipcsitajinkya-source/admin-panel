'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProduct, updateProduct, getCategories } from '@/services/api';
import Toast from '@/components/Toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<{ _id: string; name: string; icon?: string }[]>([]);
  const [form, setForm] = useState({
    nameEn: '',
    nameMr: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    Promise.all([getProduct(id), getCategories()])
      .then(([prodRes, catRes]) => {
        const p = prodRes.data;
        setCategories(catRes.data);
        setForm({
          nameEn: p.name?.en || '',
          nameMr: p.name?.mr || '',
          description: p.description || '',
          price: String(p.price),
          category: p.category || catRes.data[0]?.name || '',
          image: p.image || '',
        });
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct(id, {
        name: {
          en: form.nameEn,
          mr: form.nameMr,
        },
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image || undefined,
      });
      setToast({ message: 'Product updated!', type: 'success' });
      setTimeout(() => router.push('/products'), 1000);
    } catch {
      setToast({ message: 'Failed to update product', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Edit Product</div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back</button>
      </div>
      <div className="page-content">
        {fetching ? (
          <div className="loading-spinner" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : error ? (
          <div className="card" style={{ maxWidth: 600, padding: '40px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>😕</span>
            <div className="card-title" style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>
              Product Not Found
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              The product you are trying to edit does not exist or has been deleted.
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/products')} style={{ margin: '0 auto' }}>
              Back to Products
            </button>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-header">
              <div className="card-title">✏️ Edit Product</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Product Name (English) *</label>
                    <input
                      className="form-input"
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Name (Marathi) *</label>
                    <input
                      className="form-input"
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
                    {form.category && !categories.some(c => c.name.toLowerCase() === form.category.toLowerCase()) && (
                      <option value={form.category}>
                        {form.category} (Not in category list)
                      </option>
                    )}
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
                    💡 Paste any public image URL to update the product image.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Saving...' : '✅ Update Product'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
