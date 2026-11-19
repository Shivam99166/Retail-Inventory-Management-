import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// User pages
import UserDashboard from '../pages/user/Dashboard';
import UserProducts from '../pages/user/Products';
import UserProductDetails from '../pages/user/ProductDetails';
import UserCart from '../pages/user/Cart';
import UserCheckout from '../pages/user/Checkout';
import UserOrders from '../pages/user/Orders';
import UserOrderDetails from '../pages/user/OrderDetails';
import UserProfile from '../pages/user/Profile';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminInventory from '../pages/admin/Inventory';
import AdminWarehouses from '../pages/admin/Warehouses';
import AdminSuppliers from '../pages/admin/Suppliers';
import AdminPurchaseOrders from '../pages/admin/PurchaseOrders';
import AdminOrders from '../pages/admin/Orders';
import AdminStockTransfers from '../pages/admin/StockTransfers';
import AdminStockTransactions from '../pages/admin/StockTransactions';
import AdminReports from '../pages/admin/Reports';

import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User protected routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute role="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="products" element={<UserProducts />} />
        <Route path="products/:id" element={<UserProductDetails />} />
        <Route path="cart" element={<UserCart />} />
        <Route path="checkout" element={<UserCheckout />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="orders/:id" element={<UserOrderDetails />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Admin protected routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="stock-transfers" element={<AdminStockTransfers />} />
        <Route path="stock-transactions" element={<AdminStockTransactions />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
