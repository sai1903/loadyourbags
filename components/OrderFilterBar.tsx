
import React from 'react';

const statusOptions = [
    { label: 'On the way', value: 'On the way' }, // Represents Processing and Shipped
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Returned', value: 'Returned' },
];

const timeOptions = [
    { label: 'Anytime', value: 'anytime' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: 'Older', value: 'older' },
];


interface OrderFilterBarProps {
    selectedStatuses: string[];
    setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
    selectedTimePeriod: string;
    setSelectedTimePeriod: (value: string) => void;
    onClearFilters: () => void;
    isFiltering: boolean;
}

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
    selectedStatuses,
    setSelectedStatuses,
    selectedTimePeriod,
    setSelectedTimePeriod,
    onClearFilters,
    isFiltering
}) => {
    
    const handleStatusToggle = (statusValue: string) => {
        setSelectedStatuses(prev => 
            prev.includes(statusValue) 
                ? prev.filter(s => s !== statusValue)
                : [...prev, statusValue]
        );
    };

    return (
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Filters</h3>
            
            {/* Status Filter */}
            <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order Status</h4>
                <div className="space-y-2">
                    {statusOptions.map(status => (
                        <div key={status.value} className="flex items-center">
                            <input
                                id={`status-${status.value}`}
                                type="checkbox"
                                checked={selectedStatuses.includes(status.value)}
                                onChange={() => handleStatusToggle(status.value)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary-500 dark:focus:ring-offset-slate-800"
                            />
                            <label htmlFor={`status-${status.value}`} className="ml-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                {status.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time Period Filter */}
            <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order Time</h4>
                <div className="space-y-2">
                    {timeOptions.map(option => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={`time-${option.value}`}
                                type="radio"
                                name="time-period"
                                checked={selectedTimePeriod === option.value}
                                onChange={() => setSelectedTimePeriod(option.value)}
                                className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary-500 dark:focus:ring-offset-slate-800"
                            />
                            <label htmlFor={`time-${option.value}`} className="ml-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            {isFiltering && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors">
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderFilterBar;
