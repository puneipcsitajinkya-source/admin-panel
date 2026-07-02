'use client';
import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/services/api';
import Toast from '@/components/Toast';

interface Product {
  _id: string;
  name: {
    en: string;
    mr: string;
  };
  description: string;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  inStock: boolean;
  brand: string;
  image: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
}

const emptyForm = { nameEn: '', nameMr: '', description: '', price: '', mrp: '', discount: '0', unit: '1 pc', inStock: true, brand: '', category: '', image: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data);
        const seen = new Set<string>();
        const uniqueCats = (catRes.data || []).filter((cat: Category) => {
          const name = (cat.name || '').trim().toLowerCase();
          if (!name || seen.has(name)) return false;
          seen.add(name);
          return true;
        });
        setCategories(uniqueCats);
      })
      .catch((err) => {
        console.error(err);
        setToast({ message: 'Failed to load products or categories', type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0]?.name || 'Vegetables' });
    setEditId(null);
    setModal('add');
  };

  const openEdit = (product: Product) => {
    setForm({
      nameEn: product.name?.en || '',
      nameMr: product.name?.mr || '',
      description: product.description || '',
      price: String(product.price),
      mrp: String(product.mrp || 0),
      discount: String(product.discount || 0),
      unit: product.unit || '1 pc',
      brand: product.brand || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      category: product.category || categories[0]?.name || 'Vegetables',
      image: product.image || '',
    });
    setEditId(product._id);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn || !form.nameMr || !form.price) {
      setToast({ message: 'Name and Price are required', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      name: {
        en: form.nameEn,
        mr: form.nameMr,
      },
      description: form.description,
      price: Number(form.price),
      mrp: Number(form.mrp),
      discount: Number(form.discount),
      unit: form.unit,
      brand: form.brand,
      inStock: form.inStock,
      category: form.category,
      image: form.image || undefined,
    };
    try {
      if (modal === 'add') {
        await createProduct(payload);
        setToast({ message: '✅ Product added!', type: 'success' });
      } else if (editId) {
        await updateProduct(editId, payload);
        setToast({ message: '✅ Product updated!', type: 'success' });
      }
      closeModal();
      load();
    } catch {
      setToast({ message: 'Failed to save product', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setToast({ message: `"${name}" deleted`, type: 'success' });
      load();
    } catch {
      setToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Products</div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Product</button>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">No products yet. Add your first product!</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
              ➕ Add Product
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                {product.image ? (
                  <img src={product.image} alt={product.name?.en} className="product-card-img" />
                ) : (
                  <div className="product-card-img-placeholder">📦</div>
                )}
                <div className="product-card-body">
                  <div className="product-card-category">{product.category || 'General'}</div>
                  <div className="product-card-name">
                    {product.name ? `${product.name.en} (${product.name.mr})` : 'N/A'}
                  </div>
                  <div className="product-card-price">
                    ₹{product.price}
                    {product.mrp > product.price && (
                      <span style={{ fontSize: 12, textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: 8 }}>₹{product.mrp}</span>
                    )}
                  </div>
                  {!product.inStock && (
                    <div style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Out of Stock</div>
                  )}
                  {product.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
                      {product.description.slice(0, 60)}{product.description.length > 60 ? '...' : ''}
                    </div>
                  )}
                  {product.image && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, wordBreak: 'break-all', lineHeight: 1.4 }}>
                      🔗 {product.image.slice(0, 50)}...
                    </div>
                  )}
                  <div className="product-card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => openEdit(product)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => handleDelete(product._id, product.name?.en || 'product')}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {modal === 'add' ? '➕ Add New Product' : '✏️ Edit Product'}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                {/* Image URL — TOP of form, prominent */}
                <div className="form-group">
                  <label className="form-label">🖼️ Product Image URL</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                  {form.image ? (
                    <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 160 }}>
                      <img
                        src={form.image}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      marginTop: 10, borderRadius: 10, border: '2px dashed var(--border)',
                      height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', fontSize: 13, flexDirection: 'column', gap: 4,
                    }}>
                      <span style={{ fontSize: 28 }}>🖼️</span>
                      Paste an image URL above to preview
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    💡 Free images:{' '}
                    <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                      unsplash.com
                    </a>
                    {' '} · Right-click any image → Copy image address
                  </div>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price (₹) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="40"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">MRP (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="e.g. 50"
                      value={form.mrp}
                      onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Discount (%)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 10"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Unit</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 1 kg"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Brand</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Amul"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">In Stock?</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '8px', paddingLeft: '8px' }}>
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Yes, item is in stock</span>
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
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
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Short description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : modal === 'add' ? '✅ Add Product' : '✅ Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
