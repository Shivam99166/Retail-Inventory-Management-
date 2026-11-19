import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const ProductCard = ({ product, onAddToCart }) => {
  const { id, name, category, price, availableStock } = product;
  const isOutOfStock = availableStock <= 0;

  return (
    <div className="product-card">
      <Link to={`/user/products/${id}`} className="product-card-image overflow-hidden bg-bg flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="w-full h-full object-cover transition-transform hover:scale-105" />
        ) : (
          <span className="text-muted">No Image</span>
        )}
      </Link>
      
      <div className="product-card-body">
        <div className="product-card-category">{category}</div>
        <Link to={`/user/products/${id}`} className="product-card-name">
          {name}
        </Link>
        <div className="product-card-price">${parseFloat(price).toFixed(2)}</div>
      </div>
      
      <div className="product-card-footer">
        {isOutOfStock ? (
          <span className="text-sm font-semibold text-danger">Out of Stock</span>
        ) : (
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full"
            icon={<ShoppingCart size={16} />}
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
