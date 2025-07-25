
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { Order } from '../types';
import OrderCard from '../components/OrderCard';

const MyTrialsPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(user) {
            apiService.fetchOrdersByUserId(user.id, true)
                .then(setOrders)
                .catch(err => console.error("Failed to fetch trial orders", err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Trial Order History
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        You haven't trialed any items at home yet.
                    </p>
                    <NavLink
                        to="/"
                        className="inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
                    >
                        Explore Products
                    </NavLink>
                </div>
            )}
        </div>
    );
};

export default MyTrialsPage;
