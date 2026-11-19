import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import CartItem from '../../components/user/CartItem';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <EmptyState 
          icon={ShoppingCart}
          title="Your Cart is Empty" 
          description="Looks like you haven't added any products to your cart yet." 
          actionText="Start Shopping"
          onAction={() => navigate('/user/products')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Shopping Cart</h2>
        <Button variant="ghost" onClick={clearCart} className="text-danger">
          Clear Cart
        </Button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 350px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Cart Items ({cartItems.length})</h3>
          </div>
          <div className="card-body p-0">
            {cartItems.map(item => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        </div>

        <div className="card h-fit sticky top-20">
          <div className="card-header">
            <h3>Order Summary</h3>
          </div>
          <div className="card-body">
            <div className="flex justify-between mb-sm text-muted">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-sm text-muted">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between mb-sm text-muted">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-border mt-md pt-md mb-xl flex justify-between font-bold text-lg text-primary">
              <span>Estimated Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => navigate('/user/checkout')}
              icon={<ArrowRight size={18} />}
            >
              Proceed to Checkout
            </Button>
            <div className="mt-md text-center">
              <Link to="/user/products" className="text-sm text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
