import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import orderService from '../../services/orderService';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="page-container">
        <EmptyState 
          title="Checkout Unavailable" 
          description="You need items in your cart to proceed to checkout."
          actionText="Return to Shop"
          onAction={() => navigate('/user/products')}
        />
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: Number(item.product?.id || item.id),
          quantity: Number(item.quantity)
        }))
      };

      const res = await orderService.createOrder(orderPayload);
      const placedOrderId = res?.id ? `ORD-${res.id}` : `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderId(placedOrderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Order placement error:', err);
      // If error (e.g. backend validation or auth issue), show error message
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="page-container flex justify-center py-3xl">
        <div className="card max-w-lg w-full text-center p-2xl">
          <div className="flex justify-center text-success mb-lg">
            <CheckCircle size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-sm">Order Placed Successfully!</h2>
          <p className="text-muted mb-xl">
            Thank you for your purchase. Your order number is <strong>{orderId}</strong>. 
            We've sent a confirmation email to {formData.email}.
          </p>
          <div className="flex gap-md justify-center">
            <Button variant="outline" onClick={() => navigate('/user/orders')}>
              View Orders
            </Button>
            <Button onClick={() => navigate('/user/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Checkout</h2>
      </div>

      {errorMessage && (
        <div className="mb-lg p-md bg-danger/10 border border-danger/20 rounded-md text-danger flex items-center gap-sm text-sm">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 380px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Delivery Information</h3>
          </div>
          <div className="card-body">
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-lg">
              <div className="form-row">
                <Input id="firstName" label="First Name" required value={formData.firstName} onChange={handleChange} />
                <Input id="lastName" label="Last Name" required value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="form-row">
                <Input id="email" type="email" label="Email Address" required value={formData.email} onChange={handleChange} />
                <Input id="phone" type="tel" label="Phone Number" required value={formData.phone} onChange={handleChange} />
              </div>
              <Input id="address" label="Street Address" required value={formData.address} onChange={handleChange} />
              <div className="form-row">
                <Input id="city" label="City" required value={formData.city} onChange={handleChange} />
                <Input id="zipCode" label="Zip/Postal Code" required value={formData.zipCode} onChange={handleChange} />
              </div>
            </form>
          </div>
        </div>

        <div className="card h-fit sticky top-20">
          <div className="card-header">
            <h3>Order Summary</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md mb-xl max-h-[300px] overflow-y-auto pr-sm">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex gap-sm">
                    <span className="text-muted">{item.quantity}x</span>
                    <span className="font-medium">{item.product.name}</span>
                  </div>
                  <span className="font-medium whitespace-nowrap ml-md">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-md">
              <div className="flex justify-between mb-sm text-muted text-sm">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-sm text-muted text-sm">
                <span>Shipping (Flat Rate)</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between mb-md text-muted text-sm">
                <span>Tax (8%)</span>
                <span>${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-md mb-xl flex justify-between font-bold text-lg text-primary">
                <span>Total</span>
                <span>${(cartTotal + 10 + (cartTotal * 0.08)).toFixed(2)}</span>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                className="w-full" 
                size="lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
