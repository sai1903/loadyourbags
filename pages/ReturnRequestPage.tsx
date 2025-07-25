import React from 'react';
import { NavLink } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';

const returnSteps = [
    'Request Initiated',
    'Request Approved',
    'Item Shipped',
    'Item Received',
    'Refund Processed'
];

const ReturnRequestPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Request a Return
            </h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8 text-center">
                 <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">Our Hassle-Free Return Process</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                    To start a return, please find the relevant order in your Order History. In the meantime, here is a flowchart of what you can expect during the return process.
                 </p>
                <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-lg border dark:border-slate-700">
                    <StatusTimeline steps={returnSteps} currentStatus={'Request Initiated'} />
                </div>
                <NavLink
                    to="/orders"
                    className="mt-8 inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
                >
                    View Order History
                </NavLink>
            </div>
        </div>
    );
};

export default ReturnRequestPage;
