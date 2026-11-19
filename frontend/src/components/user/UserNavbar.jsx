import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Package, Sun, Moon } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

function UserNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/user/dashboard', label: 'Dashboard' },
    { path: '/user/products', label: 'Products' },
    { path: '/user/orders', label: 'Orders' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="user-navbar">
      <div className="user-navbar-container">
        <Link to="/user/dashboard" className="user-navbar-brand">
          <Package size={24} />
          <span>RetailHub</span>
        </Link>

        <nav className={`user-navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`user-navbar-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="user-navbar-actions">
          <button 
            className="user-navbar-icon-btn" 
            title="Toggle Theme" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/user/cart" className="user-navbar-icon-btn relative" title="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/user/profile" className="user-navbar-icon-btn" title="Profile">
            <User size={20} />
          </Link>
          <button
            className="user-navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}


export default UserNavbar;

