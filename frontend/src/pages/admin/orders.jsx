import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Eye, PackageSearch, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import orderService from '../../services/orderService';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderService.getAllOrders();
      let orderList = [];
      if (Array.isArray(res)) {
        orderList = res;
      } else if (res?.data && Array.isArray(res.data)) {
        orderList = res.data;
      }

      // Map backend OrderResponse to frontend table structure
      const formatted = orderList.map(o => ({
        id: o.id,
        displayId: `ORD-${String(o.id).padStart(4, '0')}`,
        date: o.orderDate || new Date().toISOString(),
        total: Number(o.totalAmount || 0),
        status: o.status || 'PENDING',
        customer: {
          name: o.customerName || 'Customer',
          email: o.customerEmail || 'customer@example.com',
          phone: o.customerPhone || 'N/A',
          address: o.customerAddress || 'Standard Delivery'
        },
        items: (o.items || []).map(item => ({
          product: {
            name: item.productName || 'Product',
            sku: item.sku || 'SKU'
          },
          quantity: item.quantity,
          price: Number(item.price || 0)
        }))
      }));

      setOrders(formatted);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Failed to load orders. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds so new user orders appear
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter === 'All') return true;
      return order.status === statusFilter;
    });
  }, [orders, statusFilter]);

  const handleOpenDetails = (order) => {
    setCurrentOrder(order);
    setEditStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!currentOrder) return;
    
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(currentOrder.id, editStatus);
      setOrders(prev => prev.map(o => 
        o.id === currentOrder.id ? { ...o, status: editStatus } : o
      ));
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    setUpdating(true);
    try {
      await orderService.confirmOrder(orderId);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'CONFIRMED' } : o
      ));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(prev => ({ ...prev, status: 'CONFIRMED' }));
        setEditStatus('CONFIRMED');
      }
    } catch (err) {
      console.error('Failed to confirm order:', err);
      alert('Failed to confirm order: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setUpdating(true);
    try {
      await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o
      ));
      handleCloseModal();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Failed to cancel order: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { 
      header: 'Order ID', 
      field: 'id', 
      width: '12%', 
      render: row => <span className="font-bold text-primary">{row.displayId || row.id}</span> 
    },
    { 
      header: 'Customer', 
      render: (row) => (
        <div>
          <div className="font-medium">{row.customer?.name}</div>
          <div className="text-xs text-muted">{row.customer?.email}</div>
        </div>
      )
    },
    { 
      header: 'Date', 
      field: 'date',
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      header: 'Total', 
      field: 'total',
      render: (row) => <span className="font-medium">${row.total.toFixed(2)}</span>
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
        <Button variant="ghost" size="sm" icon={<Eye size={16} />} onClick={() => handleOpenDetails(row)}>
          Manage
        </Button>
      )
    }
  ];

  if (loading && orders.length === 0) {
    return <div className="page-container flex justify-center mt-3xl"><Loader /></div>;
  }

  return (
    <div className="flex flex-col gap-xl">
      {error && (
        <div className="p-md bg-danger/10 border border-danger/20 rounded-md text-danger text-sm">
          ⚠️ {error}
        </div>
      )}

      <DataTable 
        title="Customer Orders"
        columns={columns}
        data={filteredOrders}
        actions={
          <div className="flex items-center gap-sm">
            <Button variant="outline" size="sm" icon={<RefreshCw size={16} />} onClick={fetchOrders} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Input 
              type="select" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-48"
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Input>
          </div>
        }
        emptyMessage="No orders found matching criteria."
      />

      {orders.length === 0 && !loading && (
        <EmptyState 
          icon={PackageSearch}
          title="No Orders Found"
          description="There are currently no customer orders in the system."
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={`Order Details: ${currentOrder?.displayId || currentOrder?.id}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Close</Button>
            {currentOrder?.status === 'PENDING' && (
              <Button 
                variant="outline"
                icon={<CheckCircle size={16} />}
                onClick={() => handleConfirmOrder(currentOrder.id)}
                disabled={updating}
                style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
              >
                Confirm & Deduct Stock
              </Button>
            )}
            {currentOrder?.status !== 'DELIVERED' && currentOrder?.status !== 'CANCELLED' && (
              <Button 
                variant="outline"
                icon={<XCircle size={16} />}
                onClick={() => handleCancelOrder(currentOrder.id)}
                disabled={updating}
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                Cancel Order
              </Button>
            )}
            <Button type="submit" form="order-status-form" disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </>
        }
      >
        {currentOrder && (
          <div className="flex flex-col gap-xl">
            {/* Quick Status Update Form */}
            <form id="order-status-form" onSubmit={handleUpdateStatus} className="bg-bg p-md rounded-md border border-border flex items-end gap-md">
              <div className="flex-1">
                <Input 
                  id="status" type="select" label="Update Order Status" required 
                  value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </Input>
              </div>
            </form>

            <div className="grid grid-2">
              <div className="flex flex-col gap-sm text-sm">
                <h4 className="font-semibold border-b border-border pb-xs mb-xs">Customer Details</h4>
                <div><span className="text-muted">Name:</span> {currentOrder.customer?.name}</div>
                <div><span className="text-muted">Email:</span> {currentOrder.customer?.email}</div>
                <div><span className="text-muted">Phone:</span> {currentOrder.customer?.phone}</div>
                <div><span className="text-muted">Address:</span> {currentOrder.customer?.address}</div>
              </div>
              
              <div className="flex flex-col gap-sm text-sm">
                <h4 className="font-semibold border-b border-border pb-xs mb-xs">Order Summary</h4>
                <div><span className="text-muted">Date:</span> {new Date(currentOrder.date).toLocaleString()}</div>
                <div><span className="text-muted">Status:</span> <StatusBadge text={currentOrder.status} className="ml-xs" /></div>
                <div className="font-bold mt-sm text-lg">Total: ${currentOrder.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <h4 className="font-semibold border-b border-border pb-xs mb-xs">Line Items</h4>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentOrder.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted">SKU: {item.product?.sku}</div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">${item.price.toFixed(2)}</td>
                        <td className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Orders;
