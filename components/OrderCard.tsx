
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Order, OrderStatus } from '../types';

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const statusClasses: Record<OrderStatus, string> = {
        Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        Shipped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        Returned: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const isTrial = !!order.isTrialOrder;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        {isTrial ? 'Trial Order' : 'Order'} #{order.id.split('_')[1]}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Date: {new Date(order.date).toLocaleDateString()}</p>
                </div>
                 <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-2 overflow-hidden">
                {order.items.slice(0, 5).map(item => (
                    <img key={item.productId} src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-md border-2 border-white dark:border-slate-700 flex-shrink-0"/>
                ))}
                {order.items.length > 5 && (
                    <div className="w-14 h-14 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-500 dark:text-slate-300">
                        +{order.items.length - 5}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                 <div>
                    <p className="text-sm text-slate-500">{isTrial ? 'Trial Shipping Fee' : 'Total'}</p>
                    <p className="font-bold text-xl text-primary-600 dark:text-primary-400">
                        {isTrial ? `₹799` : `₹${order.total.toLocaleString('en-IN')}`}
                    </p>
                 </div>
                <NavLink 
                    to={`/order/${order.id}`}
                    className="px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700 transition-colors"
                >
                    View Details
                </NavLink>
            </div>
        </div>
    );
};

export default OrderCard;
