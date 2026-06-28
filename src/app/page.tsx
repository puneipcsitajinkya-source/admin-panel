'use client';
import { useEffect, useState } from 'react';
import { getOrderStats, getProductStats, getOrders } from '@/services/api';

interface Stats {
  products: number;
  orders: number;
  pending: number;
  delivered: number;
  confirmed: number;
  outForDelivery: number;
}

interface Order {
  _id: string;
  mobile: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrderStats(), getProductStats(), getOrders()])
      .then(([orderRes, productRes, ordersRes]) => {
        setStats({
          products: productRes.data.total,
          orders: orderRes.data.total,
          pending: orderRes.data.pending,
          delivered: orderRes.data.delivered,
          confirmed: orderRes.data.confirmed,
          outForDelivery: orderRes.data.outForDelivery,
        });
        setRecentOrders(ordersRes.data.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
        </div>
        <span className="topbar-badge">🟢 Live</span>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">🛒</div>
                <div className="stat-info">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value text-accent">{stats?.products ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">📦</div>
                <div className="stat-info">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">{stats?.orders ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber">⏳</div>
                <div className="stat-info">
                  <div className="stat-label">Pending</div>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.pending ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">🚴</div>
                <div className="stat-info">
                  <div className="stat-label">Out for Delivery</div>
                  <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats?.outForDelivery ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple">✅</div>
                <div className="stat-info">
                  <div className="stat-label">Delivered</div>
                  <div className="stat-value text-accent">{stats?.delivered ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">📋 Recent Orders</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Mobile</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>#{order._id.slice(-6).toUpperCase()}</td>
                          <td>📱 {order.mobile}</td>
                          <td>{order.items.length} item(s)</td>
                          <td className="text-accent fw-bold">₹{order.totalAmount}</td>
                          <td>
                            <span className={`badge badge-${order.status}`}>
                              {statusLabel[order.status] || order.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
