
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchOrdersByUserId } from '../services/apiService';
import { Order } from '../types';
import OrderCard from '../components/OrderCard';
import OrderFilterBar from '../components/OrderFilterBar';

const OrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('anytime');

    useEffect(() => {
        if(user) {
            fetchOrdersByUserId(user.id, false)
                .then(setOrders)
                .catch(err => console.error("Failed to fetch orders", err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Status filtering
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(order => {
                return selectedStatuses.some(selectedStatus => {
                    if (selectedStatus === 'On the way') {
                        return order.status === 'Processing' || order.status === 'Shipped';
                    }
                    return order.status === selectedStatus;
                });
            });
        }

        // Time period filtering
        if (selectedTimePeriod !== 'anytime') {
            const now = new Date();
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.date);
                switch (selectedTimePeriod) {
                    case 'last30days':
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(now.getDate() - 30);
                        return orderDate >= thirtyDaysAgo;
                    case 'older':
                        return orderDate.getFullYear() < 2021;
                    case '2021':
                    case '2022':
                    case '2023':
                    case '2024':
                    case '2025':
                        return orderDate.getFullYear() === parseInt(selectedTimePeriod, 10);
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }, [orders, selectedStatuses, selectedTimePeriod]);
    
    const handleClearFilters = useCallback(() => {
        setSelectedStatuses([]);
        setSelectedTimePeriod('anytime');
    }, []);

    const isFiltering = selectedStatuses.length > 0 || selectedTimePeriod !== 'anytime';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Order History
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky lg:top-24">
                     <OrderFilterBar
                        selectedStatuses={selectedStatuses}
                        setSelectedStatuses={setSelectedStatuses}
                        selectedTimePeriod={selectedTimePeriod}
                        setSelectedTimePeriod={setSelectedTimePeriod}
                        onClearFilters={handleClearFilters}
                        isFiltering={isFiltering}
                    />
                </div>
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="space-y-6">
                            {filteredOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    ) : (
                         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
                            {isFiltering ? (
                                <>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                                        No orders match your current filters.
                                    </p>
                                    <button 
                                        onClick={handleClearFilters} 
                                        className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                                    >
                                        Clear filters to see all orders
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                                        You have not placed any orders yet.
                                    </p>
                                    <NavLink
                                        to="/"
                                        className="inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
                                    >
                                        Start Shopping
                                    </NavLink>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryPage;
