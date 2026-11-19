import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  Truck,
  ClipboardList,
  ShoppingBag,
  ArrowLeftRight,
  History,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';

const sidebarLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { path: '/admin/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/admin/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
  { path: '/admin/orders', label: 'Customer Orders', icon: ShoppingBag },
  { path: '/admin/stock-transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
  { path: '/admin/stock-transactions', label: 'Transactions', icon: History },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

function AdminSidebar({ collapsed }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-brand">
        <Boxes size={28} />
        {!collapsed && <span>RetailHub Admin</span>}
      </div>
      <nav className="admin-sidebar-nav">
        {sidebarLinks.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
              title={link.label}
            >
              <Icon size={20} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
