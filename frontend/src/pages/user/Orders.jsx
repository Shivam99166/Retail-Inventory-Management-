import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, Eye, RefreshCw } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import orderService from '../../services/orderService';
import { mockOrders } from '../../data/mockData';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getUserOrders();
      let orderList = [];
      if (Array.isArray(res)) {
        orderList = res;
      } else if (res?.data && Array.isArray(res.data)) {
        orderList = res.data;
      }

      const formatted = orderList.map(o => ({
        id: o.id,
        displayId: `ORD-${o.id}`,
        date: o.orderDate || new Date().toISOString(),
        total: Number(o.totalAmount || 0),
        status: o.status || 'PENDING'
      }));

      setOrders(formatted);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setOrders(mockOrders.map(o => ({
        ...o,
        displayId: o.id
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const columns = [
    { 
      header: 'Order ID', 
      field: 'id',
      render: (row) => (
        <Link to={`/user/orders/${row.id}`} className="text-primary hover:underline font-bold">
          {row.displayId || `ORD-${row.id}`}
        </Link>
      )
    },
    { 
      header: 'Date', 
      field: 'date',
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => <StatusBadge text={row.status} />
    },
    { 
      header: 'Total', 
      field: 'total',
      render: (row) => <span className="font-semibold">${row.total.toFixed(2)}</span>
    },
    {
      header: 'Action',
      render: (row) => (
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<Eye size={16} />}
          onClick={() => navigate(`/user/orders/${row.id}`)}
        >
          View
        </Button>
      )
    }
  ];

  if (loading) {
    return <div className="page-container flex justify-center mt-3xl"><Loader /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h2>My Orders</h2>
        <Button variant="outline" size="sm" icon={<RefreshCw size={16} />} onClick={fetchUserOrders}>
          Refresh
        </Button>
      </div>

      {orders.length > 0 ? (
        <DataTable 
          columns={columns}
          data={orders}
          emptyMessage="No orders found."
        />
      ) : (
        <EmptyState 
          icon={PackageSearch}
          title="No Orders Yet" 
          description="You haven't placed any orders yet. Check out our catalog to get started!"
          actionText="Browse Products"
          onAction={() => navigate('/user/products')}
        />
      )}
    </div>
  );
}

export default Orders;
