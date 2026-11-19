import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertTriangle } from 'lucide-react';

import { CartContext } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import productService from '../../services/productService';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        setProduct(res?.data || res || null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="page-container flex justify-center mt-3xl"><Loader /></div>;
  }

  if (!product) {
    return (
      <div className="page-container">
        <EmptyState 
          title="Product Not Found" 
          description="The product you are looking for does not exist or has been removed." 
          actionText="Back to Products"
          onAction={() => navigate('/user/products')}
        />
      </div>
    );
  }

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = !isOutOfStock && product.availableStock <= product.reorderLevel;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="page-container">
      <Link to="/user/products" className="inline-flex items-center gap-xs text-muted hover:text-primary mb-xl transition-base">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="card">
        <div className="grid grid-2 p-xl">
          {/* Product Image */}
          <div className="bg-bg rounded-lg overflow-hidden flex items-center justify-center text-muted min-h-[300px]">
             {product.imageUrl ? (
               <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
             ) : (
               <span>Product Image (600x600)</span>
             )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-sm">
              {product.category}
            </div>
            <h1 className="text-3xl font-bold text-primary mb-xs">{product.name}</h1>
            <div className="text-sm text-muted mb-lg">SKU: {product.sku}</div>
            
            <div className="text-3xl font-bold text-primary mb-lg">
              ${parseFloat(product.price).toFixed(2)}
            </div>

            <p className="text-base text-muted mb-xl leading-relaxed">
              {product.description}
            </p>

            <div className="mt-auto pt-xl border-t border-border">
              {/* Stock Status Indicator */}
              <div className="mb-lg flex items-center gap-sm font-medium">
                {isOutOfStock ? (
                  <span className="text-danger flex items-center gap-xs"><AlertTriangle size={18} /> Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-warning flex items-center gap-xs"><AlertTriangle size={18} /> Only {product.availableStock} left in stock!</span>
                ) : (
                  <span className="text-success flex items-center gap-xs"><Check size={18} /> In Stock ({product.availableStock} available)</span>
                )}
              </div>

              {!isOutOfStock && (
                <div className="flex items-center gap-lg">
                  <div className="flex items-center border border-border rounded-md">
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-muted hover:bg-bg transition-base"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-muted hover:bg-bg transition-base"
                      onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                    >
                      +
                    </button>
                  </div>

                  <Button 
                    size="lg" 
                    className="flex-1"
                    icon={added ? <Check size={20} /> : <ShoppingCart size={20} />}
                    onClick={handleAddToCart}
                    variant={added ? 'success' : 'primary'}
                  >
                    {added ? 'Added to Cart' : 'Add to Cart'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
