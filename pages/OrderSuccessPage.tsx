import React from 'react';
import { useLocation, NavLink, Navigate } from 'react-router-dom';
import { CheckCircleIcon } from '../components/Icons';

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();

    if (!location.state) {
        // If someone navigates here directly, redirect them to home
        return <Navigate to="/" replace />;
    }

    const { orderId, total, items, paymentMethod } = location.state;

    return (
        <div className="max-w-3xl mx-auto text-center bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl border dark:border-slate-700">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                Payment Successful!
            </h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                Your order has been placed successfully.
            </p>

            <div className="mt-8 text-left bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border dark:border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Order ID:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-100">{orderId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Method:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{paymentMethod}</span>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Items Ordered</h3>
                 <div className="flex justify-center items-center gap-2 overflow-hidden flex-wrap">
                    {items.slice(0, 8).map((item: any) => (
                        <img key={item.id} src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border-2 border-white dark:border-slate-700 flex-shrink-0"/>
                    ))}
                    {items.length > 8 && (
                        <div className="w-16 h-16 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-500 dark:text-slate-300">
                            +{items.length - 8}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <NavLink 
                    to="/" 
                    className="w-full sm:w-auto px-8 py-3 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Continue Shopping
                </NavLink>
                <NavLink 
                    to={`/invoice/${orderId}`}
                    className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
                >
                    View Invoice
                </NavLink>
            </div>
        </div>
    );
};

export default OrderSuccessPage;