import React, { useState, useMemo } from 'react';
import { Plus, Edit, Eye, Archive } from 'lucide-react';
import { mockProducts, mockCategories } from '../../data/mockData';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';

function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit, view
  const [currentProduct, setCurrentProduct] = useState(null);

  const initialFormState = {
    name: '', sku: '', category: 'Electronics', description: '',
    price: '', reorderLevel: '', availableStock: 0, status: 'ACTIVE'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter products for table
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, categoryFilter]);

  // Actions
  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    setCurrentProduct(product);
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({ ...product });
    } else {
      setFormData({ ...initialFormState, id: `P00${products.length + 1}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'view') {
      handleCloseModal();
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
      availableStock: parseInt(formData.availableStock, 10) || 0,
    };

    if (modalMode === 'add') {
      setProducts([...products, payload]);
    } else if (modalMode === 'edit') {
      setProducts(products.map(p => p.id === currentProduct.id ? payload : p));
    }
    handleCloseModal();
  };

  const handleToggleStatus = (product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
  };

  const columns = [
    { header: 'SKU', field: 'sku', width: '12%' },
    { 
      header: 'Product Name', 
      field: 'name',
      render: (row) => <span className="font-medium text-primary">{row.name}</span>
    },
    { header: 'Category', field: 'category' },
    { 
      header: 'Price', 
      field: 'price',
      render: (row) => `$${parseFloat(row.price).toFixed(2)}`
    },
    { 
      header: 'Stock', 
      field: 'availableStock',
      render: (row) => (
        <span className={row.availableStock <= row.reorderLevel ? 'text-danger font-bold' : ''}>
          {row.availableStock}
        </span>
      )
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => <StatusBadge text={row.status} />
    },
    {
      header: 'Actions',
      width: '180px',
      render: (row) => (
        <div className="flex gap-sm">
          <Button variant="ghost" size="sm" icon={<Eye size={16} />} onClick={() => handleOpenModal('view', row)} title="View" />
          <Button variant="ghost" size="sm" icon={<Edit size={16} />} onClick={() => handleOpenModal('edit', row)} title="Edit" />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Archive size={16} />} 
            onClick={() => handleToggleStatus(row)} 
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            className={row.status === 'ACTIVE' ? 'text-danger hover:bg-danger-light' : 'text-success hover:bg-success-light'}
          />
        </div>
      )
    }
  ];

  const tableHeaderActions = (
    <div className="flex flex-wrap gap-md items-center w-full md:w-auto">
      <SearchBar 
        value={searchQuery} 
        onChange={e => setSearchQuery(e.target.value)} 
        placeholder="Search SKU or Name"
        className="w-full md:w-64"
      />
      <Input 
        type="select" 
        value={categoryFilter} 
        onChange={e => setCategoryFilter(e.target.value)}
        className="w-full md:w-48"
      >
        {mockCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </Input>
      <Button icon={<Plus size={18} />} onClick={() => handleOpenModal('add')}>
        Add Product
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-xl">
      <DataTable 
        title="Products"
        columns={columns}
        data={filteredProducts}
        actions={tableHeaderActions}
        emptyMessage="No products found matching criteria."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'Add New Product' : modalMode === 'edit' ? 'Edit Product' : 'Product Details'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              {modalMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalMode !== 'view' && (
              <Button type="submit" form="product-form">
                {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
              </Button>
            )}
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="form-row">
            <Input 
              id="name" label="Product Name" required 
              value={formData.name} onChange={handleChange} disabled={modalMode === 'view'} 
            />
            <Input 
              id="sku" label="SKU" required 
              value={formData.sku} onChange={handleChange} disabled={modalMode === 'view'} 
            />
          </div>
          
          <div className="form-row">
            <Input 
              id="category" type="select" label="Category" required 
              value={formData.category} onChange={handleChange} disabled={modalMode === 'view'}
            >
              {mockCategories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Input>
            <Input 
              id="status" type="select" label="Status" 
              value={formData.status} onChange={handleChange} disabled={modalMode === 'view'}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Input>
          </div>

          <Input 
            id="description" type="textarea" label="Description" 
            value={formData.description} onChange={handleChange} disabled={modalMode === 'view'} 
          />

          <div className="form-row">
            <Input 
              id="price" type="number" label="Price ($)" step="0.01" min="0" required 
              value={formData.price} onChange={handleChange} disabled={modalMode === 'view'} 
            />
            <Input 
              id="reorderLevel" type="number" label="Reorder Level" min="0" required 
              value={formData.reorderLevel} onChange={handleChange} disabled={modalMode === 'view'} 
            />
          </div>
          
          {modalMode !== 'add' && (
            <div className="form-row">
               <Input 
                id="availableStock" type="number" label="Available Stock" min="0"
                value={formData.availableStock} onChange={handleChange} disabled={modalMode === 'view'} 
                hint="Use Inventory module to manage stock properly. Direct edit for dev only."
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default Products;
