'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, updateOrderStatus } from '@/services/api';
import Toast from '@/components/Toast';

interface Order {
  _id: string;
  mobile: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  latitude: number;
  longitude: number;
  address?: string;
  customerName?: string;
  instructions?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'out_for_delivery', label: '🚴 Out for Delivery' },
  { value: 'delivered', label: '📦 Delivered' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shareOrder, setShareOrder] = useState<Order | null>(null);
  const [shareText, setShareText] = useState('');

  const load = () => {
    setLoading(true);
    getOrders()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      setToast({ message: 'Status updated!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  const handleShare = (order: Order) => {
    const text = `📦 Order #${order._id.slice(-6).toUpperCase()}
👤 Customer: ${order.customerName || 'Guest'}
📱 Mobile: ${order.mobile}
🏠 Address: ${order.address || 'No Address Provided'}
📍 Location: https://www.google.com/maps?q=${order.latitude},${order.longitude}${order.instructions ? `\n📝 Instructions: ${order.instructions}` : ''}`;
    setShareOrder(order);
    setShareText(text);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Orders</div>
        <span className="topbar-badge">{orders.length} Total</span>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">No orders yet</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Delivery Details</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        <Link href={`/orders/${order._id}`} style={{ color: 'var(--accent)' }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customerName || 'Guest'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📱 {order.mobile}</div>
                      </td>
                      <td>
                        {order.items.slice(0, 2).map((i, idx) => (
                          <div key={idx} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {i.name} × {i.quantity}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div style={{ fontSize: 11, color: 'var(--accent)' }}>+{order.items.length - 2} more</div>
                        )}
                      </td>
                      <td className="text-accent fw-bold">₹{order.totalAmount}</td>
                       <td>
                        {order.instructions && (
                          <div style={{ fontSize: 12, marginBottom: 4, color: 'var(--warning)', fontWeight: 600 }}>
                            📝 {order.instructions}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <a
                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="map-link"
                            style={{ margin: 0 }}
                          >
                            📍 Map
                          </a>
                          <button
                            onClick={() => handleShare(order)}
                            className="map-link"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 500,
                              padding: 0
                            }}
                          >
                            🔗 Share with Rider
                          </button>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '5px 30px 5px 10px', fontSize: 12, width: 'auto' }}
                          value={order.status}
                          disabled={updating === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {shareOrder && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">🚚 Share with Delivery Partner</div>
              <button className="modal-close" onClick={() => setShareOrder(null)}>✕</button>
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
                <button className="btn btn-secondary" onClick={() => setShareOrder(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setToast({ message: 'Copied to clipboard!', type: 'success' });
                    setShareOrder(null);
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
