
import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { Product, ApprovalStatus, Category, Slide } from '../../types';
import { PencilSquareIcon, TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '../../components/Icons';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
);

const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const statusMap = {
        [ApprovalStatus.APPROVED]: { text: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: <CheckCircleIcon className="w-4 h-4" /> },
        [ApprovalStatus.PENDING_APPROVAL]: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <ClockIcon className="w-4 h-4" /> },
        [ApprovalStatus.REJECTED]: { text: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    const { text, color, icon } = statusMap[status] || statusMap[ApprovalStatus.PENDING_APPROVAL];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            {icon}
            {text}
        </span>
    );
};

const SellerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });
    const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', imageUrl: '', link: '/' });

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setError(null);
            apiService.fetchProductsBySellerId(user.id)
                .then(setProducts)
                .catch(err => {
                    console.error("Failed to fetch seller products:", err);
                    setError("Could not load your products.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        const originalProducts = [...products];
        setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));

        try {
            await apiService.deleteProduct(productId);
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('An error occurred while deleting the product. Please try again.');
            setProducts(originalProducts);
        }
    };

    const handleProposeCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.proposeCategory(newCategory as Omit<Category, 'status'>);
            alert('Category proposed successfully and is pending admin approval.');
            setNewCategory({ name: '', imageUrl: '' });
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to propose category.");
        }
    };
    
    const handleProposeSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.proposeSlide(newSlide as Omit<Slide, 'id' | 'status'>);
            alert('Slide proposed successfully and is pending admin approval.');
            setNewSlide({ title: '', subtitle: '', imageUrl: '', link: '/' });
        } catch (error) {
            alert("Failed to propose slide.");
        }
    };


    const { approvedCount, pendingCount, rejectedCount, totalSales } = useMemo(() => {
        const stats = products.reduce((acc, p) => {
            if (p.status === ApprovalStatus.APPROVED) {
                acc.approvedCount++;
                // Sales calculation only for approved products
                acc.totalSales += p.retailPrice * p.reviews.length; 
            } else if (p.status === ApprovalStatus.PENDING_APPROVAL) {
                acc.pendingCount++;
            } else if (p.status === ApprovalStatus.REJECTED) {
                acc.rejectedCount++;
            }
            return acc;
        }, { approvedCount: 0, pendingCount: 0, rejectedCount: 0, totalSales: 0 });
        
        return stats;
    }, [products]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Seller Dashboard</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">Welcome, {user?.name}!</p>
                </div>
                <NavLink
                    to="/product/add"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105"
                >
                    Add New Product
                </NavLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Approved Listings" value={approvedCount.toString()} />
                <StatCard title="Pending Review" value={pendingCount.toString()} />
                <StatCard title="Rejected Listings" value={rejectedCount.toString()} />
                <StatCard title="Estimated Sales" value={`₹${totalSales.toLocaleString('en-IN')}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Propose Category */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Propose New Category</h3>
                    <form onSubmit={handleProposeCategory} className="space-y-3">
                        <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} type="text" placeholder="Category Name" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                        <input value={newCategory.imageUrl} onChange={e => setNewCategory({...newCategory, imageUrl: e.target.value})} type="text" placeholder="Image URL for Category" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                        <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700">Submit for Approval</button>
                    </form>
                </div>

                {/* Propose Slide */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Propose Homepage Slide</h3>
                    <form onSubmit={handleProposeSlide} className="space-y-3">
                        <input value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})} type="text" placeholder="Title" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                        <input value={newSlide.imageUrl} onChange={e => setNewSlide({...newSlide, imageUrl: e.target.value})} type="text" placeholder="Image URL (1200x600)" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                        <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700">Submit for Approval</button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Products</h3>
                {isLoading ? (
                     <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : products.length > 0 ? (
                    <div className="mt-4 flow-root">
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} /></div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">₹{product.retailPrice.toLocaleString('en-IN')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={product.status} /></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <NavLink to={`/product/edit/${product.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                                    <PencilSquareIcon className="w-4 h-4" /> Edit
                                                </NavLink>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="inline-flex items-center gap-1 p-1.5 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300 font-semibold text-xs rounded-md hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-center py-8">You haven't added any products yet.</p>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
