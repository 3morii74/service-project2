'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll();
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <>
      <main className="container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          My Orders
        </h1>

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading orders...</div>}

        {!loading && orders.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
              You don't have any orders yet.
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => router.push('/products')}
            >
              Start Shopping
            </button>
          </div>
        )}

        <div className="grid">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    Order #{order.orderNumber}
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      background: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      fontWeight: '600',
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Items:</h4>
                {order.items.map((item: any, index: number) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <p>
                      {item.productName} x {item.quantity} - ${item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  Total: ${order.totalAmount}
                </p>
                <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

