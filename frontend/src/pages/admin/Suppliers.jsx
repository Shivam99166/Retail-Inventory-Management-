import React, { useState } from 'react';
import { Plus, Edit2, Building2 } from 'lucide-react';
import { mockSuppliers } from '../../data/mockData';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';

function Suppliers() {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentSupplier, setCurrentSupplier] = useState(null);

  const initialFormState = {
    name: '', contactPerson: '', email: '', phone: '', leadTime: '', status: 'ACTIVE'
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (mode, supp = null) => {
    setModalMode(mode);
    setCurrentSupplier(supp);
    if (supp && mode === 'edit') {
      setFormData({ ...supp });
    } else {
      setFormData({ ...initialFormState, id: `SUP-0${suppliers.length + 1}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      leadTime: parseInt(formData.leadTime, 10) || 0,
    };

    if (modalMode === 'add') {
      setSuppliers([...suppliers, payload]);
    } else if (modalMode === 'edit') {
      setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? payload : s));
    }
    handleCloseModal();
  };

  const columns = [
    { header: 'ID', field: 'id', width: '10%' },
    { 
      header: 'Supplier Name', 
      field: 'name',
      render: (row) => <span className="font-medium text-primary flex items-center gap-sm"><Building2 size={16} /> {row.name}</span>
    },
    { header: 'Contact Person', field: 'contactPerson' },
    { 
      header: 'Contact Details', 
      render: (row) => (
        <div className="text-sm">
          <div>{row.email}</div>
          <div className="text-muted">{row.phone}</div>
        </div>
      )
    },
    { 
      header: 'Lead Time', 
      field: 'leadTime',
      render: (row) => `${row.leadTime} Days`
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => <StatusBadge text={row.status} />
    },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} onClick={() => handleOpenModal('edit', row)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-xl">
      <DataTable 
        title="Supplier Directory"
        columns={columns}
        data={suppliers}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => handleOpenModal('add')}>
            Add Supplier
          </Button>
        }
        emptyMessage="No suppliers found."
      />

      {suppliers.length === 0 && (
        <EmptyState 
          icon={Building2}
          title="No Suppliers Found"
          description="You haven't added any suppliers yet."
          actionText="Add Supplier"
          onAction={() => handleOpenModal('add')}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" form="supplier-form">
              {modalMode === 'add' ? 'Create Supplier' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form id="supplier-form" onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <Input 
            id="name" label="Supplier Company Name" required 
            value={formData.name} onChange={handleChange} 
          />
          
          <div className="form-row">
            <Input 
              id="contactPerson" label="Contact Person" required 
              value={formData.contactPerson} onChange={handleChange} 
            />
            <Input 
              id="status" type="select" label="Status" 
              value={formData.status} onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Input>
          </div>

          <div className="form-row">
            <Input 
              id="email" type="email" label="Email Address" required 
              value={formData.email} onChange={handleChange} 
            />
            <Input 
              id="phone" type="tel" label="Phone Number" required 
              value={formData.phone} onChange={handleChange} 
            />
          </div>

          <Input 
            id="leadTime" type="number" label="Average Lead Time (Days)" min="1" required 
            value={formData.leadTime} onChange={handleChange} 
            hint="Expected days between PO submission and delivery."
          />
        </form>
      </Modal>
    </div>
  );
}

export default Suppliers;
