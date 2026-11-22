import React, { useState } from 'react';
import { Plus, Eye, ClipboardList } from 'lucide-react';
import { mockPurchaseOrders, mockSuppliers } from '../../data/mockData';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentPO, setCurrentPO] = useState(null);

  const initialFormState = {
    supplierId: '', date: new Date().toISOString().split('T')[0], expectedDelivery: '', totalAmount: '', status: 'DRAFT'
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (mode, po = null) => {
    setModalMode(mode);
    setCurrentPO(po);
    if (po && (mode === 'edit' || mode === 'view')) {
      setFormData({
        ...po,
        date: new Date(po.date).toISOString().split('T')[0],
        expectedDelivery: new Date(po.expectedDelivery).toISOString().split('T')[0]
      });
    } else {
      setFormData({ ...initialFormState, id: `PO-2023-00${purchaseOrders.length + 1}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPO(null);
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

    const supplier = mockSuppliers.find(s => s.id === formData.supplierId);
    
    const payload = {
      ...formData,
      supplierName: supplier ? supplier.name : 'Unknown Supplier',
      totalAmount: parseFloat(formData.totalAmount) || 0,
      date: new Date(formData.date).toISOString(),
      expectedDelivery: new Date(formData.expectedDelivery).toISOString()
    };

    if (modalMode === 'add') {
      setPurchaseOrders([...purchaseOrders, payload]);
    } else if (modalMode === 'edit') {
      setPurchaseOrders(purchaseOrders.map(p => p.id === currentPO.id ? payload : p));
    }
    handleCloseModal();
  };

  const handleUpdateStatus = (po, newStatus) => {
    setPurchaseOrders(purchaseOrders.map(p => p.id === po.id ? { ...p, status: newStatus } : p));
  };

  const columns = [
    { header: 'PO Number', field: 'id', width: '15%', render: row => <span className="font-bold text-primary">{row.id}</span> },
    { header: 'Supplier', field: 'supplierName' },
    { 
      header: 'Date Created', 
      field: 'date',
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      header: 'Expected Delivery', 
      field: 'expectedDelivery',
      render: (row) => new Date(row.expectedDelivery).toLocaleDateString()
    },
    { 
      header: 'Total Amount', 
      field: 'totalAmount',
      render: (row) => <span className="font-medium">${row.totalAmount.toFixed(2)}</span>
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
        <div className="flex gap-sm items-center">
          <Button variant="ghost" size="sm" icon={<Eye size={16} />} onClick={() => handleOpenModal('view', row)} title="View Details" />
          
          {row.status === 'DRAFT' && (
            <Button size="sm" onClick={() => handleUpdateStatus(row, 'SENT')}>Send</Button>
          )}
          {row.status === 'SENT' && (
            <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(row, 'RECEIVED')}>Receive</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-xl">
      <DataTable 
        title="Purchase Orders"
        columns={columns}
        data={purchaseOrders}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => handleOpenModal('add')}>
            Create PO
          </Button>
        }
        emptyMessage="No purchase orders found."
      />

      {purchaseOrders.length === 0 && (
        <EmptyState 
          icon={ClipboardList}
          title="No Purchase Orders"
          description="You haven't created any purchase orders yet."
          actionText="Create PO"
          onAction={() => handleOpenModal('add')}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'Create Purchase Order' : modalMode === 'edit' ? 'Edit PO' : 'PO Details'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              {modalMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalMode !== 'view' && (
              <Button type="submit" form="po-form">
                {modalMode === 'add' ? 'Create PO' : 'Save Changes'}
              </Button>
            )}
          </>
        }
      >
        <form id="po-form" onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <Input 
            id="supplierId" type="select" label="Supplier" required 
            value={formData.supplierId} onChange={handleChange} disabled={modalMode === 'view'}
          >
            <option value="">Select a Supplier</option>
            {mockSuppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Input>
          
          <div className="form-row">
            <Input 
              id="date" type="date" label="PO Date" required 
              value={formData.date} onChange={handleChange} disabled={modalMode === 'view'} 
            />
            <Input 
              id="expectedDelivery" type="date" label="Expected Delivery" required 
              value={formData.expectedDelivery} onChange={handleChange} disabled={modalMode === 'view'} 
            />
          </div>

          <div className="form-row">
            <Input 
              id="totalAmount" type="number" label="Total Amount ($)" step="0.01" min="0" required 
              value={formData.totalAmount} onChange={handleChange} disabled={modalMode === 'view'} 
            />
            <Input 
              id="status" type="select" label="Status" required 
              value={formData.status} onChange={handleChange} disabled={modalMode === 'view'}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </Input>
          </div>
          
          {modalMode === 'view' && (
            <div className="mt-md p-md bg-bg border border-border rounded-md text-sm text-muted">
              <span className="font-semibold text-primary">Note:</span> Line items are simplified for this demo phase.
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default PurchaseOrders;
