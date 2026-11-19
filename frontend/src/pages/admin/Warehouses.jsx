import React, { useState } from 'react';
import { Plus, Edit2, Warehouse } from 'lucide-react';
import { mockWarehouses } from '../../data/mockData';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';

function Warehouses() {
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentWarehouse, setCurrentWarehouse] = useState(null);

  const initialFormState = {
    name: '', code: '', location: '', manager: '', capacity: '', status: 'ACTIVE'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Actions
  const handleOpenModal = (mode, wh = null) => {
    setModalMode(mode);
    setCurrentWarehouse(wh);
    if (wh && mode === 'edit') {
      setFormData({ ...wh });
    } else {
      setFormData({ ...initialFormState, id: `WH-0${warehouses.length + 1}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentWarehouse(null);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity, 10) || 0,
    };

    if (modalMode === 'add') {
      setWarehouses([...warehouses, payload]);
    } else if (modalMode === 'edit') {
      setWarehouses(warehouses.map(w => w.id === currentWarehouse.id ? payload : w));
    }
    handleCloseModal();
  };

  const columns = [
    { header: 'Code', field: 'code', width: '12%' },
    { 
      header: 'Warehouse Name', 
      field: 'name',
      render: (row) => <span className="font-medium text-primary flex items-center gap-sm"><Warehouse size={16} /> {row.name}</span>
    },
    { header: 'Location', field: 'location' },
    { header: 'Manager', field: 'manager' },
    { 
      header: 'Capacity', 
      field: 'capacity',
      render: (row) => row.capacity.toLocaleString()
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
        title="Warehouse Facilities"
        columns={columns}
        data={warehouses}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => handleOpenModal('add')}>
            Add Warehouse
          </Button>
        }
        emptyMessage="No warehouses configured."
      />

      {warehouses.length === 0 && (
        <EmptyState 
          icon={Warehouse}
          title="No Warehouses Found"
          description="You haven't set up any warehouse locations yet."
          actionText="Add Warehouse"
          onAction={() => handleOpenModal('add')}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" form="warehouse-form">
              {modalMode === 'add' ? 'Create Warehouse' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form id="warehouse-form" onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <Input 
            id="name" label="Warehouse Name" required 
            value={formData.name} onChange={handleChange} 
            placeholder="e.g. Central Hub"
          />
          
          <div className="form-row">
            <Input 
              id="code" label="Location Code" required 
              value={formData.code} onChange={handleChange} 
              placeholder="e.g. NY-01"
            />
            <Input 
              id="status" type="select" label="Status" 
              value={formData.status} onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </Input>
          </div>

          <Input 
            id="location" label="Physical Address" required 
            value={formData.location} onChange={handleChange} 
          />

          <div className="form-row">
            <Input 
              id="manager" label="Facility Manager" required 
              value={formData.manager} onChange={handleChange} 
            />
            <Input 
              id="capacity" type="number" label="Max Capacity (Units)" min="0" required 
              value={formData.capacity} onChange={handleChange} 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Warehouses;
