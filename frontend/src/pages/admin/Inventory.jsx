import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Edit2, RefreshCw } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import DataTable from '../../components/admin/DataTable';
import StockStatus from '../../components/admin/StockStatus';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';
import Loader from '../../components/common/Loader';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventory();
      const list = res?.data ?? res ?? [];
      setInventory(Array.isArray(list) ? list : []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const productName = item.productName ?? item.product?.name ?? '';
      const sku = item.productSku ?? item.product?.sku ?? '';
      const stock = item.availableStock ?? 0;
      const reorder = item.reorderLevel ?? item.product?.reorderLevel ?? 10;

      const matchSearch =
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (statusFilter !== 'All') {
        const isOut = stock <= 0;
        const isLow = !isOut && stock <= reorder;
        if (statusFilter === 'In Stock') matchStatus = !isOut && !isLow;
        if (statusFilter === 'Low Stock') matchStatus = isLow;
        if (statusFilter === 'Out of Stock') matchStatus = isOut;
      }
      return matchSearch && matchStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const handleOpenAdjustment = (item) => {
    setSelectedItem(item);
    setAdjustmentType('add');
    setAdjustmentQty('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Local-only optimistic update (stock adjustments would need a backend endpoint to persist)
  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(adjustmentQty, 10);
    if (!qty || qty <= 0) return;
    setInventory(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        const currentStock = item.availableStock ?? 0;
        const newStock = adjustmentType === 'add'
          ? currentStock + qty
          : Math.max(0, currentStock - qty);
        return { ...item, availableStock: newStock };
      }
      return item;
    }));
    handleCloseModal();
  };

  const columns = [
    { header: 'SKU', field: 'productSku', width: '12%', render: row => row.productSku ?? row.product?.sku ?? '-' },
    {
      header: 'Product',
      render: row => <span className="font-medium text-primary">{row.productName ?? row.product?.name ?? '-'}</span>
    },
    { header: 'Warehouse', render: row => row.warehouseName ?? row.warehouse?.name ?? '-' },
    {
      header: 'Available',
      field: 'availableStock',
      render: row => <span className="font-bold text-lg">{row.availableStock ?? 0}</span>
    },
    {
      header: 'Status',
      render: row => <StockStatus availableStock={row.availableStock ?? 0} reorderLevel={row.reorderLevel ?? row.product?.reorderLevel ?? 10} />
    },
    {
      header: 'Actions',
      width: '120px',
      render: row => (
        <Button
          variant="outline"
          size="sm"
          icon={<Edit2 size={14} />}
          onClick={() => handleOpenAdjustment(row)}
        >
          Adjust
        </Button>
      )
    }
  ];

  const tableHeaderActions = (
    <div className="flex gap-md items-center flex-wrap w-full md:w-auto">
      <SearchBar
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search SKU or Name"
        className="w-full md:w-64"
      />
      <Input
        type="select"
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="w-full md:w-48"
      >
        <option value="All">All Statuses</option>
        <option value="In Stock">In Stock</option>
        <option value="Low Stock">Low Stock</option>
        <option value="Out of Stock">Out of Stock</option>
      </Input>
      <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={fetchInventory}>
        Refresh
      </Button>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-xl">
      <DataTable
        title="Inventory Levels"
        columns={columns}
        data={filteredInventory}
        actions={tableHeaderActions}
        emptyMessage="No inventory items found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adjust Stock Level"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" form="adjust-form" icon={<PackagePlus size={16} />}>
              Confirm Adjustment
            </Button>
          </>
        }
      >
        {selectedItem && (
          <form id="adjust-form" onSubmit={handleAdjustmentSubmit} className="flex flex-col gap-lg">
            <div className="bg-bg p-md rounded-md border border-border mb-sm">
              <div className="text-sm text-muted mb-xs">Product</div>
              <div className="font-bold text-lg">{selectedItem.productName ?? selectedItem.product?.name}</div>
              <div className="text-sm text-muted mt-xs">
                Warehouse: <span className="font-medium">{selectedItem.warehouseName ?? selectedItem.warehouse?.name}</span>
              </div>
              <div className="text-sm text-muted mt-xs">
                Current Stock: <span className="font-bold text-primary">{selectedItem.availableStock ?? 0}</span>
              </div>
            </div>
            <div className="form-row">
              <Input id="type" type="select" label="Adjustment Type" required
                value={adjustmentType} onChange={e => setAdjustmentType(e.target.value)}>
                <option value="add">Add Stock (+)</option>
                <option value="remove">Remove Stock (-)</option>
              </Input>
              <Input id="qty" type="number" label="Quantity" min="1" required
                value={adjustmentQty} onChange={e => setAdjustmentQty(e.target.value)} />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Inventory;
