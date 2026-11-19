import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { CartContext } from '../../context/CartContext';
import { mockOrders, mockProducts } from '../../data/mockData';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { PackageSearch, ShoppingBag, Clock, ArrowRight } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const { cartCount } = useContext(CartContext);
  
  // Fake stats for user dashboard
  const activeOrdersCount = mockOrders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
  const recentOrders = mockOrders.slice(0, 3);
  const featuredProducts = mockProducts.slice(0, 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Welcome back, {user?.name || 'User'}!</h2>
      </div>

      <div className="grid grid-3 mb-xl">
        <StatCard 
          title="Active Orders" 
          value={activeOrdersCount} 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          title="Items in Cart" 
          value={cartCount} 
          icon={ShoppingBag} 
          color="blue" 
        />
        <StatCard 
          title="Total Orders" 
          value={mockOrders.length} 
          icon={PackageSearch} 
          color="green" 
        />
      </div>

      <div className="grid grid-2">
        {/* Recent Orders Section */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/user/orders" className="flex items-center gap-sm text-primary text-sm font-medium hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body p-0">
            {recentOrders.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td><Link to={`/user/orders/${order.id}`} className="text-primary hover:underline">{order.id}</Link></td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td><StatusBadge text={order.status} /></td>
                        <td className="font-medium">${order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-xl text-center text-muted">No recent orders found.</div>
            )}
          </div>
        </div>

        {/* Quick Product Access Section */}
        <div className="card">
          <div className="card-header">
            <h3>Featured Products</h3>
            <Link to="/user/products" className="flex items-center gap-sm text-primary text-sm font-medium hover:underline">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-md">
              {featuredProducts.map(product => (
                <div key={product.id} className="flex items-center gap-md p-md border border-border-light rounded-md hover:border-primary transition-base">
                  <div className="w-12 h-12 bg-bg rounded-sm flex items-center justify-center text-muted flex-shrink-0">IMG</div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/user/products/${product.id}`} className="text-base font-medium text-primary hover:underline truncate block">
                      {product.name}
                    </Link>
                    <div className="text-sm text-muted">${product.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
