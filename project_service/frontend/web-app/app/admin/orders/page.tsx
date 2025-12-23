'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';

export default function AdminOrders() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(userData);
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getAllAdmin();
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) return;

    try {
      await orderApi.delete(id);
      setSuccess('Order deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete order');
      setTimeout(() => setError(''), 3000);
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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
          Order Management
        </h1>
        <button
          onClick={() => router.push('/admin')}
          className="btn"
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.5rem 1rem',
          }}
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            {success}
          </div>
        )}

        {/* Orders List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              All Orders ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No orders found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Order #</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>User ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Items</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Payment</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{order.orderNumber}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                          {order.userId?.substring(0, 8)}...
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          {order.items?.length || 0} item(s)
                        </div>
                        {order.items?.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {item.productName} x{item.quantity}
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            +{order.items.length - 2} more
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        ${order.totalAmount?.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status),
                        }}>
                          {order.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          {order.paymentStatus}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleDelete(order._id, order.orderNumber)}
                          className="btn"
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
