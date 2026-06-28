'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrder, updateOrderStatus } from '@/services/api';
import Toast from '@/components/Toast';

interface Order {
  _id: string;
  mobile: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  items: { name: string; quantity: number; price: number; image?: string }[];
  address?: string;
  subtotal?: number;
  deliveryFee?: number;
  gstAmount?: number;
  handlingFee?: number;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'out_for_delivery', label: '🚴 Out for Delivery' },
  { value: 'delivered', label: '📦 Delivered' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    getOrder(id)
      .then((res) => {
        setOrder(res.data);
        setStatus(res.data.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(id, status);
      setOrder((prev) => prev ? { ...prev, status } : prev);
      setToast({ message: 'Status updated!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (!order) return;
    const text = `📦 Order #${order._id.slice(-6).toUpperCase()}
📱 Mobile: ${order.mobile}
🏠 Address: ${order.address || 'No Address Provided'}
📍 Location: https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
    setShareText(text);
    setShowShareModal(true);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          {loading ? 'Loading Order...' : order ? `Order #${order._id.slice(-6).toUpperCase()}` : 'Order Not Found'}
        </div>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Back</button>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : !order ? (
          <div className="card" style={{ maxWidth: 600, padding: '40px 20px', textAlign: 'center', margin: '20px auto' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>😕</span>
            <div className="card-title" style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>
              Order Not Found
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              The order you are trying to view does not exist or has been deleted.
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/orders')} style={{ margin: '0 auto' }}>
              Back to Orders
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Order Info */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">📋 Order Info</div>
              <button
                className="btn btn-secondary"
                onClick={handleShare}
                style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🚚 Share with Delivery Partner
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div className="form-label">Customer Mobile</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>📱 {order.mobile}</div>
                </div>
                <div>
                  <div className="form-label">Order Date</div>
                  <div style={{ marginTop: 4 }}>{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="form-label">Total Amount</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>₹{order.totalAmount}</div>
                </div>
                <div>
                  <div className="form-label">Location</div>
                  <a
                    href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="map-link"
                    style={{ marginTop: 4, display: 'inline-flex' }}
                  >
                    📍 {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)} — Open in Maps
                  </a>
                </div>
                {order.address && (
                  <div>
                    <div className="form-label">Delivery Address</div>
                    <div style={{ marginTop: 4, color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                      🏠 {order.address}
                    </div>
                  </div>
                )}
                <div>
                  <div className="form-label" style={{ marginBottom: 8 }}>Update Status</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      className="form-input"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span className={`badge badge-${order.status}`}>
                      Current: {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🛒 Ordered Items</div>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{order.items.length} items</span>
            </div>
            <div className="card-body">
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="order-item-img" />
                    ) : (
                      <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥦</div>
                    )}
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-qty">× {item.quantity}</div>
                    <div className="order-item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {order.subtotal !== undefined && order.subtotal > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      {order.gstAmount !== undefined && order.gstAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>GST (Tax)</span>
                          <span>+ ₹{order.gstAmount}</span>
                        </div>
                      )}
                      {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Delivery Fee</span>
                          <span>+ ₹{order.deliveryFee}</span>
                        </div>
                      )}
                      {order.handlingFee !== undefined && order.handlingFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Handling Charges</span>
                          <span>+ ₹{order.handlingFee}</span>
                        </div>
                      )}
                    </>
                  ) : null}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                    <span>Total</span>
                    <span className="text-accent">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">🚚 Share with Delivery Partner</div>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Here are the details prepared for your delivery partner. You can edit the text before copying if needed:
              </p>
              <textarea
                className="form-input form-textarea"
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                rows={6}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setToast({ message: 'Copied to clipboard!', type: 'success' });
                    setShowShareModal(false);
                  }}
                >
                  📋 Copy Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
