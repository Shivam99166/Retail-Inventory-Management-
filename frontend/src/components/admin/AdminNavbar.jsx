import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function AdminNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Derive page title from current path
  const getPageTitle = () => {
    const path = location.pathname.replace('/admin/', '');
    const titles = {
      'dashboard': 'Dashboard',
      'products': 'Product Management',
      'inventory': 'Inventory',
      'warehouses': 'Warehouses',
      'suppliers': 'Suppliers',
      'purchase-orders': 'Purchase Orders',
      'orders': 'Customer Orders',
      'stock-transfers': 'Stock Transfers',
      'stock-transactions': 'Stock Transactions',
      'reports': 'Reports',
    };
    return titles[path] || 'Admin';
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button className="admin-navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu size={22} />
        </button>
        <h1 className="admin-navbar-title">{getPageTitle()}</h1>
      </div>
      <div className="admin-navbar-right">
        <button 
          className="admin-navbar-icon-btn" 
          title="Toggle Theme" 
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="admin-navbar-icon-btn" title="Notifications">
          <Bell size={20} />
        </button>
        <Link to="/login" className="admin-navbar-icon-btn" title="Logout">
          <LogOut size={20} />
        </Link>
      </div>
    </header>
  );
}

export default AdminNavbar;
