import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import HomeSections from './pages/HomeSections';
import Coupons from './pages/Coupons';

// Auth Guard Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user.role === 'super_admin' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Product Routes */}
            <Route path="products" element={<Products />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            
            {/* Category Routes */}
            <Route path="categories" element={<Categories />} />
            
            {/* Order Routes */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            
            {/* User Routes */}
            <Route path="users" element={<Users />} />
            
            {/* Home Section Routes */}
            <Route path="home-sections" element={<HomeSections />} />
            
            {/* Coupon Routes */}
            <Route path="coupons" element={<Coupons />} />
          </Route>
          
          {/* Redirect root to admin dashboard or login */}
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
