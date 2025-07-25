
import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import apiService from '../services/apiService';
import { Order, OrderItem } from '../types';
import StatusTimeline from '../components/StatusTimeline';
import { DocumentArrowDownIcon } from '../components/Icons';

const OrderItemRow: React.FC<{ item: OrderItem }> = ({ item }) => (
    <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
        <div className="flex-grow">
            <NavLink to={`/product/${item.productId}`} className="font-bold hover:text-primary-500 transition-colors">{item.name}</NavLink>
            <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
        </div>
        <p className="font-semibold text-right">
            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
        </p>
    </div>
);

const orderSteps: Record<string, string[]> = {
    standard: ['Processing', 'Shipped', 'Delivered'],
    trial: ['Processing', 'Shipped', 'Delivered', 'Returned'],
    cancelled: ['Processing', 'Cancelled']
};


const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setIsLoading(false);
            setError("No order ID provided.");
            return;
        }

        apiService.fetchOrderById(orderId)
            .then(data => {
                if (data) {
                    setOrder(data);
                } else {
                    setError("Order not found.");
                }
            })
            .catch(() => setError("Failed to fetch order details."))
            .finally(() => setIsLoading(false));

    }, [orderId]);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }
    
    if (error || !order) {
        return <div className="text-center text-red-500 py-10">{error || "Order not found."}</div>;
    }

    const isTrial = !!order.isTrialOrder;
    let relevantSteps = orderSteps.standard;
    if (isTrial) relevantSteps = orderSteps.trial;
    if (order.status === 'Cancelled') relevantSteps = orderSteps.cancelled;


    return (
        <div className="space-y-8">
             <div>
                <NavLink to="/orders" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                     Back to Order History
                </NavLink>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {isTrial ? 'Trial ' : ''}Order Details
                        </h1>
                         <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
                            Order #{order.id.split('_')[1]} &bull; Placed on {new Date(order.date).toLocaleDateString()}
                         </p>
                    </div>
                    {!isTrial && (
                        <NavLink 
                            to={`/invoice/${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                            Download Invoice
                        </NavLink>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4">Order Status</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <StatusTimeline steps={relevantSteps} currentStatus={order.status} />
                </div>
            </div>
            
            {order.deliveryInfo && (order.status === 'Shipped' || order.status === 'Delivered') && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-slate-500">Delivery Person</p>
                            <p className="font-semibold">{order.deliveryInfo.deliveryPersonName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Contact</p>
                            <p className="font-semibold">{order.deliveryInfo.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Vehicle Number</p>
                            <p className="font-semibold">{order.deliveryInfo.vehicleNumber}</p>
                        </div>
                    </div>
                 </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8 space-y-4">
                    <h2 className="text-xl font-bold mb-2">Items in this order ({order.items.length})</h2>
                    {order.items.map(item => <OrderItemRow key={item.productId} item={item} />)}
                </div>
                 <div className="lg:col-span-1 space-y-8 sticky top-24">
                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
                                <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-300">Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <span>Total</span>
                                <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                           <p className="font-semibold text-slate-800 dark:text-slate-100">{order.shippingAddress.street}</p>
                           <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                           <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                 </div>
            </div>

        </div>
    );
};

export default OrderDetailsPage;
