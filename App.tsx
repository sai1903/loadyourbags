
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import SellerRegistrationPage from './pages/seller/SellerRegistrationPage';
import MyTrialsPage from './pages/MyTrialsPage';
import { UserRole } from './types';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AddressesPage from './pages/AddressesPage';
import ReturnRequestPage from './pages/ReturnRequestPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import PaymentPage from './pages/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import InvoicePage from './pages/InvoicePage';


import { ShoppingBagIcon, FacebookIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from './components/Icons';
import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/globals.css';


const Footer: React.FC = () => (
    <footer className="bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <NavLink to="/" className="flex items-center gap-2">
                <ShoppingBagIcon className="h-8 w-8 text-primary-600"/>
                <span className="text-2xl font-bold text-slate-800 dark:text-white">Load Your Bags</span>
            </NavLink>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-sm text-sm">
              Your one-stop shop for everything you need, delivered with care and quality you can trust.
            </p>
          </div>
    
          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><NavLink to="/category/Music" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Music</NavLink></li>
              <li><NavLink to="/category/Electronics" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Electronics</NavLink></li>
              <li><NavLink to="/category/Furniture" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Furniture</NavLink></li>
              <li><NavLink to="/category/Sports" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Sports</NavLink></li>
            </ul>
          </div>
    
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Help</h3>
            <ul className="mt-4 space-y-2 text-sm">
               <li><NavLink to="/orders" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Track Order</NavLink></li>
               <li><NavLink to="/returns" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">Returns</NavLink></li>
               <li><NavLink to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">FAQs</NavLink></li>
            </ul>
          </div>
    
          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Newsletter</h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">Get the latest deals and updates.</p>
            <form className="mt-4 flex" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500"/>
              <button type="submit" className="bg-primary-600 text-white px-3 py-2 rounded-r-md hover:bg-primary-700 text-sm font-semibold">Go</button>
            </form>
          </div>
    
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center">
           <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Load Your Bags. All rights reserved.</p>
           <div className="flex gap-5 mt-4 sm:mt-0">
              <a href="#" aria-label="Facebook" className="text-slate-500 hover:text-primary-500 transition-colors"><FacebookIcon className="w-5 h-5" /></a>
              <a href="#" aria-label="Instagram" className="text-slate-500 hover:text-primary-500 transition-colors"><InstagramIcon className="w-5 h-5" /></a>
              <a href="#" aria-label="Twitter" className="text-slate-500 hover:text-primary-500 transition-colors"><TwitterIcon className="w-5 h-5" /></a>
              <a href="#" aria-label="LinkedIn" className="text-slate-500 hover:text-primary-500 transition-colors"><LinkedInIcon className="w-5 h-5" /></a>
           </div>
        </div>
      </div>
    </footer>
);

function App() {
  const [dbStatus, setDbStatus] = useState<string>('Connecting to Supabase...');

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('todos').select().limit(1);
      if (error) {
        setDbStatus('Supabase connection failed: ' + error.message);
      } else {
        setDbStatus('Supabase connection successful!');
      }
    }
    testConnection();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <HashRouter>
            <div className="flex flex-col min-h-screen font-sans text-slate-800 dark:text-slate-200">
              <Navbar />
              <main className="flex-grow container-responsive py-4 sm:py-6 lg:py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/seller/register" element={<SellerRegistrationPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />

                 {/* Customer Routes */}
                <Route 
                  path="/payment" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <PaymentPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/order-success" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/invoice/:orderId" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <InvoicePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-trials" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <MyTrialsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/order/:orderId" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <WishlistPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/addresses" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <AddressesPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/returns" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
                      <ReturnRequestPage />
                    </ProtectedRoute>
                  } 
                />


                {/* Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Seller Routes */}
                <Route 
                  path="/seller/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
                      <SellerDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Shared Admin/Seller Routes */}
                <Route 
                  path="/product/add" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.SELLER, UserRole.ADMIN]}>
                      <AddProductPage />
                    </ProtectedRoute>
                  } 
                />
                 <Route 
                  path="/product/edit/:id" 
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.SELLER, UserRole.ADMIN]}>
                      <EditProductPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback & Deprecated Routes */}
                <Route path="/login" element={<SignInPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;