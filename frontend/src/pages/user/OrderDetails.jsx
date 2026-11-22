import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import orderService from '../../services/orderService';
import { mockOrders } from '../../data/mockData';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(id);
        const o = res?.data || res;
        if (o && o.id) {
          setOrder({
            id: o.id,
            displayId: `ORD-${o.id}`,
            date: o.orderDate || new Date().toISOString(),
            status: o.status || 'PENDING',
            total: Number(o.totalAmount || 0),
            customer: {
              name: o.customerName || 'Customer',
              email: o.customerEmail || 'customer@example.com',
              phone: o.customerPhone || 'N/A',
              address: o.customerAddress || 'Standard Shipping'
            },
            items: (o.items || []).map(item => ({
              product: {
                name: item.productName || 'Product',
                sku: item.sku || 'SKU'
              },
              quantity: item.quantity,
              price: Number(item.price || 0)
            }))
          });
        } else {
          // Fallback mock
          const found = mockOrders.find(mo => mo.id === id || String(mo.id) === String(id));
          setOrder(found || null);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        const found = mockOrders.find(mo => mo.id === id || String(mo.id) === String(id));
        setOrder(found || null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="page-container flex justify-center mt-3xl"><Loader /></div>;
  }

  if (!order) {
    return (
      <div className="page-container">
        <EmptyState 
          title="Order Not Found" 
          description={`We couldn't find order ${id}.`}
          actionText="Back to Orders"
          onAction={() => navigate('/user/orders')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/user/orders" className="inline-flex items-center gap-xs text-muted hover:text-primary mb-xl transition-base">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="page-header mb-md">
        <h2 className="flex items-center gap-md">
          Order {order.displayId || order.id}
          <StatusBadge text={order.status} />
        </h2>
        <div className="text-muted">
          Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 380px' }}>
        <div className="flex flex-col gap-xl">
          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-sm"><Package size={18} /> Order Items</h3>
            </div>
            <div className="card-body p-0">
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
                    {(order.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted">SKU: {item.product?.sku}</div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">${Number(item.price || 0).toFixed(2)}</td>
                        <td className="text-right font-medium">${(Number(item.price || 0) * Number(item.quantity)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-bg flex flex-col items-end gap-sm">
              <div className="flex justify-between w-64 text-sm text-muted">
                <span>Subtotal</span>
                <span>${Number(order.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-sm text-muted">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between w-64 font-bold text-lg text-primary mt-sm pt-sm border-t border-border">
                <span>Total</span>
                <span>${Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-xl">
          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-sm"><MapPin size={18} /> Customer Information</h3>
            </div>
            <div className="card-body text-sm leading-relaxed text-secondary">
              <div className="font-medium text-primary mb-xs">{order.customer?.name}</div>
              <div>{order.customer?.address}</div>
              <div className="mt-md pt-md border-t border-border">
                <div>Email: {order.customer?.email}</div>
                <div>Phone: {order.customer?.phone}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-sm"><Truck size={18} /> Tracking Information</h3>
            </div>
            <div className="card-body text-sm text-secondary">
              {['SHIPPED', 'DELIVERED'].includes(order.status) ? (
                <>
                  <div className="font-medium mb-xs">Carrier: Express Cargo</div>
                  <div>Tracking Number: <span className="text-primary font-medium">TRK-{Math.floor(10000000 + Math.random() * 90000000)}</span></div>
                </>
              ) : (
                <div className="text-muted italic">Tracking information will be available once the order is shipped.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
