import React, { useState, useEffect, useContext, useMemo } from 'react';
import { CartContext } from '../../context/CartContext';
import ProductCard from '../../components/user/ProductCard';
import SearchBar from '../../components/common/SearchBar';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import productService from '../../services/productService';
import { mockProducts, mockCategories } from '../../data/mockData';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.allSettled([
          productService.getProducts({ activeOnly: true }),
          productService.getCategories()
        ]);

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
          setProducts(prodRes.value);
        } else if (prodRes.status === 'fulfilled' && prodRes.value?.data && Array.isArray(prodRes.value.data)) {
          setProducts(prodRes.value.data);
        } else {
          setProducts(mockProducts);
        }

        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
          const catNames = ['All', ...catRes.value.map(c => c.name)];
          setCategories(catNames);
        } else if (catRes.status === 'fulfilled' && catRes.value?.data && Array.isArray(catRes.value.data)) {
          const catNames = ['All', ...catRes.value.data.map(c => c.name)];
          setCategories(catNames);
        } else {
          setCategories(mockCategories);
        }
      } catch (err) {
        setProducts(mockProducts);
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const name = product.name || '';
      const sku = product.sku || '';
      const cat = product.categoryName || product.category || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
      const isActive = product.active !== undefined ? product.active : (product.status === 'ACTIVE');
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return <div className="page-container flex justify-center mt-3xl"><Loader /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Product Catalog</h2>
      </div>

      <div className="filter-bar">
        <SearchBar 
          placeholder="Search products by name or SKU..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-md"
        />
        <div className="filter-group">
          <Input 
            type="select" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Input>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-4">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No products found" 
          description="Try adjusting your search query or filters to find what you're looking for." 
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      )}
    </div>
  );
}

export default Products;
