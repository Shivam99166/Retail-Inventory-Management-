import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, product, quantity } = item;
  const { name, sku, price, availableStock } = product;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < availableStock) {
      onUpdateQuantity(id, quantity + 1);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <span>IMG</span>
      </div>
      
      <div className="cart-item-info">
        <div className="cart-item-name">{name}</div>
        <div className="cart-item-sku">SKU: {sku}</div>
      </div>
      
      <div className="cart-item-quantity">
        <button 
          onClick={handleDecrease} 
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span>{quantity}</span>
        <button 
          onClick={handleIncrease} 
          disabled={quantity >= availableStock}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
      
      <div className="cart-item-price">
        ${(parseFloat(price) * quantity).toFixed(2)}
      </div>
      
      <button 
        className="cart-item-remove" 
        onClick={() => onRemove(id)}
        aria-label="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default CartItem;
