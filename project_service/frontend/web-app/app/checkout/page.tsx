'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function Checkout() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(cartData);
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        items: cart,
        totalAmount: calculateTotal() * 1.1, // Including tax
        shippingAddress: formData,
      };

      const response = await orderApi.create(orderData);

      if (response.data.success) {
        // Clear cart
        localStorage.setItem('cart', JSON.stringify([]));

        showToast({ message: 'Order placed successfully!', type: 'success' });
        setTimeout(() => router.push('/orders'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      <main className="container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          Checkout
        </h1>

        {error && <div className="error">{error}</div>}

        <div className="checkout-container">
          <div className="checkout-form">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Address</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Zip Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678 or +201012345678"
                  pattern="^(\+20|0)?1[0125]\d{8}$"
                  title="Please enter a valid Egyptian phone number (11 digits starting with 01, or with +20)"
                  required
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Required for delivery contact (Egyptian mobile: 01X XXXX XXXX)
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => router.push('/cart')}
              >
                Back to Cart
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>

            <div className="order-items">
              {cart.map((item) => (
                <div key={item.productId} className="order-item">
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.productName}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1rem', paddingTop: '1rem' }}>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>

              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
              </div>

              <div style={{ borderTop: '2px solid #e5e7eb', marginTop: '1rem', paddingTop: '1rem' }}>
                <div className="summary-row" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                  <span>Total:</span>
                  <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .checkout-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-top: 2rem;
          }

          @media (max-width: 768px) {
            .checkout-container {
              grid-template-columns: 1fr;
            }
          }

          .checkout-form {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .checkout-summary {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            height: fit-content;
            position: sticky;
            top: 2rem;
          }

          .order-items {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .order-item {
            display: flex;
            justify-content: space-between;
            align-items: start;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .order-item:last-child {
            border-bottom: none;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
          }
        `}</style>
      </main>
    </>
  );
}

