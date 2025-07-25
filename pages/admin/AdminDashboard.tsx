
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { User, UserRole, Product, Category, Slide, ApprovalStatus, AdminAnalyticsData, Order } from '../../types';
import { CheckCircleIcon, UsersIcon, PencilSquareIcon, TrashIcon, ClockIcon, XCircleIcon, ShoppingBagIcon, TagIcon, ChartBarIcon, PlusIcon, DocumentIcon, BanknotesIcon } from '../../components/Icons';

type Tab = 'OVERVIEW' | 'FINANCIALS' | 'APPROVALS' | 'PRODUCTS' | 'CATEGORIES' | 'USERS';

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

// Helper component for consistent table styling
const Table: React.FC<{ head: React.ReactNode, children: React.ReactNode }> = ({ head, children }) => (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">{head}</thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">{children}</tbody>
        </table>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
    
    // State for modals and forms
    const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [allUsers, allProducts, allCategories, allSlides, analytics, allOrders] = await Promise.all([
                apiService.fetchUsers(),
                apiService.fetchAllProducts(),
                apiService.fetchAllCategories(),
                apiService.fetchAllSlides(),
                apiService.fetchAdminAnalytics(),
                apiService.fetchAllOrders(),
            ]);
            setUsers(allUsers);
            setProducts(allProducts);
            setCategories(allCategories);
            setSlides(allSlides);
            setAnalyticsData(analytics);
            setOrders(allOrders);
        } catch (e) {
            setError("Could not fetch dashboard data.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const getSellerName = (sellerId: string) => {
        if (sellerId === adminUser?.id) return 'In-House (Admin)';
        const seller = users.find(u => u.id === sellerId);
        return seller?.sellerInfo?.companyName || seller?.name || 'Unknown Seller';
    };

    // --- Action Handlers ---
    const handleApproveSeller = async (userId: string) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: UserRole.SELLER } : u));
        setSelectedSeller(null);
        try { await apiService.approveSeller(userId); } catch (error) { alert("Approval failed."); fetchAllData(); }
    };
    
    const handleApprovalAction = async (type: 'product' | 'category' | 'slide', id: string, status: ApprovalStatus) => {
        let reason = '';
        if (status === ApprovalStatus.REJECTED) {
            reason = prompt('Optional: Provide a reason for rejection.') || '';
        }
        try {
            if (type === 'product') await apiService.updateProductStatus(id, status, reason);
            else if (type === 'category') await apiService.updateCategoryStatus(id, status, reason);
            else if (type === 'slide') await apiService.updateSlideStatus(id, status, reason);
            fetchAllData();
        } catch (error) { alert(`Failed to update status for ${type}.`); }
    };
    
    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
        try { await apiService.deleteProduct(productId); fetchAllData(); } catch (e) { alert(e instanceof Error ? e.message : 'Deletion failed'); }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.name || !newCategory.imageUrl) return;
        try { await apiService.addCategory(newCategory); setNewCategory({ name: '', imageUrl: '' }); fetchAllData(); } catch (e) { alert(e instanceof Error ? e.message : 'Failed to add category');}
    };

    const handleDeleteCategory = async (categoryName: string) => {
        if (!window.confirm(`Are you sure you want to delete the "${categoryName}" category?`)) return;
        try { await apiService.deleteCategory(categoryName); fetchAllData(); } catch(e) { alert(e instanceof Error ? e.message : 'Deletion failed'); }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This is irreversible.")) return;
        try { await apiService.deleteUser(userId); fetchAllData(); } catch(e) { alert(e instanceof Error ? e.message : 'Deletion failed'); }
    };

    const handleUpdateUserRole = async (userId: string, role: UserRole) => {
        try { await apiService.updateUserRole(userId, role); fetchAllData(); } catch(e) { alert(e instanceof Error ? e.message : 'Update failed'); }
    };

    const pendingSellers = users.filter(u => u.role === UserRole.PENDING_SELLER);
    const pendingProducts = products.filter(p => p.status === ApprovalStatus.PENDING_APPROVAL);
    const pendingCategories = categories.filter(c => c.status === ApprovalStatus.PENDING_APPROVAL);
    const pendingSlides = slides.filter(s => s.status === ApprovalStatus.PENDING_APPROVAL);
    const totalPendingCount = pendingSellers.length + pendingProducts.length + pendingCategories.length + pendingSlides.length;

    const renderTabContent = () => {
        if (isLoading) {
             return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 py-10">{error}</div>;
        }
        switch(activeTab) {
            case 'OVERVIEW': return <OverviewTab analytics={analyticsData} />;
            case 'FINANCIALS': return <FinancialsTab orders={orders} products={products} users={users} />;
            case 'APPROVALS': return <ApprovalsTab {...{ pendingSellers, pendingProducts, pendingCategories, pendingSlides, handleApprovalAction, handleApproveSeller, setSelectedSeller }} />;
            case 'PRODUCTS': return <ProductManagementTab products={products} getSellerName={getSellerName} onDelete={handleDeleteProduct} />;
            case 'CATEGORIES': return <CategoryManagementTab categories={categories} newCategory={newCategory} setNewCategory={setNewCategory} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />;
            case 'USERS': return <UserManagementTab users={users} adminId={adminUser?.id} onRoleChange={handleUpdateUserRole} onDelete={handleDeleteUser} />;
            default: return null;
        }
    }
    
    const TabButton: React.FC<{tab: Tab, label: string, count?: number, icon: React.ReactNode}> = ({tab, label, count, icon}) => (
         <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 text-sm font-medium transition-colors rounded-t-lg border-b-2 ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'}`}>
            {icon} {label} {typeof count !== 'undefined' && <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'bg-slate-200 dark:bg-slate-700'}`}>{count}</span>}
        </button>
    );

    return (
        <>
            {selectedSeller && <SellerDetailModal seller={selectedSeller} onClose={() => setSelectedSeller(null)} onApprove={handleApproveSeller} />}
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Admin Dashboard</h1>

                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-2 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        <TabButton tab="OVERVIEW" label="Overview" icon={<ChartBarIcon className="w-5 h-5" />} />
                        <TabButton tab="FINANCIALS" label="Financials" icon={<BanknotesIcon className="w-5 h-5" />} />
                        <TabButton tab="APPROVALS" label="Approvals" count={totalPendingCount} icon={<ClockIcon className="w-5 h-5"/>} />
                        <TabButton tab="PRODUCTS" label="Products" count={products.length} icon={<ShoppingBagIcon className="w-5 h-5"/>} />
                        <TabButton tab="CATEGORIES" label="Categories" count={categories.length} icon={<TagIcon className="w-5 h-5"/>} />
                        <TabButton tab="USERS" label="Users" count={users.length} icon={<UsersIcon className="w-5 h-5"/>} />
                    </nav>
                </div>
                
                <div>{renderTabContent()}</div>
            </div>
        </>
    );
};

// --- Child Components for Tabs ---

const OverviewTab: React.FC<{ analytics: AdminAnalyticsData | null }> = ({ analytics }) => {
    if (!analytics) return null;
    const { totalSales, totalOrders, totalCustomers, totalSellers, salesByMonth, userRoleDistribution } = analytics;
    const maxSales = Math.max(...salesByMonth.map(s => s.sales), 0);
    const roleColors: Record<string, string> = { [UserRole.ADMIN]: 'bg-red-500', [UserRole.SELLER]: 'bg-blue-500', [UserRole.CUSTOMER]: 'bg-green-500', [UserRole.PENDING_SELLER]: 'bg-yellow-500' };
    const totalUserCount = useMemo(() => userRoleDistribution.reduce((sum, item) => sum + item.count, 0), [userRoleDistribution]);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Total Sales</p><p className="text-2xl font-bold">{formatCurrency(totalSales)}</p></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Active Sellers</p><p className="text-2xl font-bold">{totalSellers}</p></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Customers</p><p className="text-2xl font-bold">{totalCustomers}</p></div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                    <h3 className="font-bold mb-4">Monthly Sales</h3>
                    <div className="flex gap-2 h-48 items-end">
                        {salesByMonth.map(d => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-primary-500/20 hover:bg-primary-500/40 rounded-t-md transition-all" style={{ height: `${maxSales > 0 ? (d.sales / maxSales) * 100 : 0}%`}} title={formatCurrency(d.sales)}></div>
                                <p className="text-xs text-slate-500">{d.month}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                     <h3 className="font-bold mb-4">User Roles</h3>
                     <div className="space-y-3">
                        {userRoleDistribution.map(r => (
                            <div key={r.role}>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{r.role}</span><span className="text-slate-500">{r.count}</span></div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className={`${roleColors[r.role]} h-2.5 rounded-full`} style={{width: `${totalUserCount > 0 ? (r.count / totalUserCount) * 100 : 0}%`}}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
             </div>
        </div>
    );
};

const FinancialsTab: React.FC<{ orders: Order[], products: Product[], users: User[] }> = ({ orders, products, users }) => {
    const financialData = useMemo(() => {
        const sellerData = new Map<string, { totalRetailValue: number; totalWholesaleValue: number; itemsSold: number; }>();

        orders.forEach(order => {
            if (order.status !== 'Delivered' || order.isTrialOrder) return;

            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;

                const sellerId = product.sellerId;
                const stats = sellerData.get(sellerId) || { totalRetailValue: 0, totalWholesaleValue: 0, itemsSold: 0 };

                const retailValue = item.price * item.quantity;
                const wholesaleValue = product.wholesalePrice * item.quantity;

                stats.totalRetailValue += retailValue;
                stats.totalWholesaleValue += wholesaleValue;
                stats.itemsSold += item.quantity;
                
                sellerData.set(sellerId, stats);
            });
        });

        const sellersWithFinancials = Array.from(sellerData.entries()).map(([sellerId, data]) => {
            const seller = users.find(u => u.id === sellerId);
            return {
                sellerId,
                sellerName: seller?.sellerInfo?.companyName || seller?.name || 'Unknown Seller',
                ...data,
                platformRevenue: data.totalRetailValue - data.totalWholesaleValue,
            };
        }).sort((a, b) => b.totalWholesaleValue - a.totalWholesaleValue);

        const summary = sellersWithFinancials.reduce((acc, seller) => {
            acc.totalGMV += seller.totalRetailValue;
            acc.totalPayouts += seller.totalWholesaleValue;
            acc.totalRevenue += seller.platformRevenue;
            return acc;
        }, { totalGMV: 0, totalPayouts: 0, totalRevenue: 0 });

        return { sellers: sellersWithFinancials, summary };
    }, [orders, products, users]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Gross Sales (GMV)</p><p className="text-2xl font-bold">{formatCurrency(financialData.summary.totalGMV)}</p></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Total Seller Payouts</p><p className="text-2xl font-bold text-red-500">{formatCurrency(financialData.summary.totalPayouts)}</p></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow"><p className="text-sm text-slate-500 dark:text-slate-400">Platform Revenue</p><p className="text-2xl font-bold text-green-500">{formatCurrency(financialData.summary.totalRevenue)}</p></div>
            </div>
             <div>
                <h3 className="text-xl font-bold mb-4">Seller Payout Summary</h3>
                <Table head={
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Seller</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Items Sold</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Gross Sales</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Platform Fee</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Net Payout Due</th>
                    </tr>
                }>
                    {financialData.sellers.map(seller => (
                        <tr key={seller.sellerId}>
                            <td className="px-4 py-3 whitespace-nowrap font-medium">{seller.sellerName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">{seller.itemsSold}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(seller.totalRetailValue)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">{formatCurrency(seller.platformRevenue)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-primary-600 dark:text-primary-400">{formatCurrency(seller.totalWholesaleValue)}</td>
                        </tr>
                    ))}
                     {financialData.sellers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-slate-500">No delivered orders to calculate financials yet.</td>
                        </tr>
                    )}
                </Table>
             </div>
        </div>
    );
}

const ApprovalsTab: React.FC<{
    pendingSellers: User[];
    pendingProducts: Product[];
    pendingCategories: Category[];
    pendingSlides: Slide[];
    handleApprovalAction: (type: 'product' | 'category' | 'slide', id: string, status: ApprovalStatus) => void;
    handleApproveSeller: (userId: string) => void;
    setSelectedSeller: (seller: User | null) => void;
}> = ({ pendingSellers, pendingProducts, pendingCategories, pendingSlides, handleApprovalAction, handleApproveSeller, setSelectedSeller }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow space-y-3">
            <h3 className="font-bold">Pending Seller Approvals ({pendingSellers.length})</h3>
            {pendingSellers.length > 0 ? pendingSellers.map(seller => (
                 <div key={seller.id} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md flex justify-between items-center">
                    <div>{seller.sellerInfo?.companyName || seller.name}</div>
                    <button onClick={() => setSelectedSeller(seller)} className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded-md">View</button>
                </div>
            )) : <p className="text-sm text-slate-500 text-center py-4">No pending sellers.</p>}
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow space-y-3">
             <h3 className="font-bold">Pending Content ({pendingProducts.length + pendingCategories.length + pendingSlides.length})</h3>
             {pendingProducts.map(p => <ApprovalItem key={p.id} item={p} onAction={(s) => handleApprovalAction('product', p.id, s)} />)}
             {pendingCategories.map(c => <ApprovalItem key={c.name} item={c} onAction={(s) => handleApprovalAction('category', c.name, s)} />)}
             {pendingSlides.map(s => <ApprovalItem key={s.id} item={s} onAction={(status) => handleApprovalAction('slide', s.id, status)} />)}
             {pendingProducts.length + pendingCategories.length + pendingSlides.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No pending content.</p>}
        </div>
    </div>
);

const ApprovalItem: React.FC<{item: Product | Category | Slide, onAction: (status: ApprovalStatus) => void}> = ({ item, onAction }) => (
    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
        <div className="flex items-center gap-3">
            <img src={item.imageUrl} className="w-10 h-10 rounded-md object-cover" />
            <span>{'name' in item ? item.name : item.title}</span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onAction(ApprovalStatus.APPROVED)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md">Approve</button>
            <button onClick={() => onAction(ApprovalStatus.REJECTED)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md">Reject</button>
        </div>
    </div>
);

const ProductManagementTab: React.FC<{ products: Product[], getSellerName: (id: string) => string, onDelete: (id: string) => void }> = ({ products, getSellerName, onDelete }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold">Manage Products</h2>
             <NavLink to="/product/add" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700"><PlusIcon className="w-5 h-5"/>Add In-House Product</NavLink>
        </div>
        <Table head={
            <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
        }>
            {products.map(p => (
                <tr key={p.id}>
                    <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-3"><img className="h-10 w-10 rounded-md object-cover" src={p.imageUrl} /><div><div className="font-medium">{p.name}</div><div className="text-sm text-slate-500">{formatCurrency(p.retailPrice)}</div></div></div></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{getSellerName(p.sellerId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right space-x-2">
                        <NavLink to={`/product/edit/${p.id}`} className="p-2 text-slate-500 hover:text-primary-600"><PencilSquareIcon className="w-5 h-5 inline-block"/></NavLink>
                        <button onClick={() => onDelete(p.id)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5 inline-block"/></button>
                    </td>
                </tr>
            ))}
        </Table>
    </div>
);

const CategoryManagementTab: React.FC<{ categories: Category[], newCategory: {name: string, imageUrl: string}, setNewCategory: any, onAdd: (e: React.FormEvent) => void, onDelete: (name: string) => void }> = ({ categories, newCategory, setNewCategory, onAdd, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Manage Categories</h2>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-2">
                {categories.map(c => (
                     <div key={c.name} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                        <div className="flex items-center gap-3 flex-grow">
                            <img src={c.imageUrl} className="w-10 h-10 rounded-md object-cover"/>
                            <span className="flex-1">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <StatusBadge status={c.status} />
                           <button onClick={() => onDelete(c.name)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={onAdd} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow space-y-3">
                <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="Category Name" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                <input value={newCategory.imageUrl} onChange={e => setNewCategory({...newCategory, imageUrl: e.target.value})} placeholder="Image URL" className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" required />
                <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700">Add Category</button>
            </form>
        </div>
    </div>
);

const UserManagementTab: React.FC<{users: User[], adminId?: string, onRoleChange: (id: string, role: UserRole) => void, onDelete: (id: string) => void}> = ({users, adminId, onRoleChange, onDelete}) => {
    const availableRoles = Object.values(UserRole).filter(r => r !== UserRole.PENDING_SELLER);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Manage Users</h2>
            <Table head={
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
            }>
                {users.map(u => (
                    <tr key={u.id}>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={u.avatar} className="w-10 h-10 rounded-full" /><div><div className="font-medium">{u.name}</div><div className="text-sm text-slate-500">{u.email}</div></div></div></td>
                        <td className="px-4 py-3">
                            {u.id === adminId ? <span className="text-sm font-semibold">{u.role}</span> : (
                                <select value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)} className="px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md">
                                    {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            )}
                        </td>
                        <td className="px-4 py-3 text-right">
                             {u.id !== adminId && (
                                <button onClick={() => onDelete(u.id)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                            )}
                        </td>
                    </tr>
                ))}
            </Table>
        </div>
    );
};


const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const statusMap = {
        [ApprovalStatus.APPROVED]: { text: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        [ApprovalStatus.PENDING_APPROVAL]: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
        [ApprovalStatus.REJECTED]: { text: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const { text, color } = statusMap[status] || statusMap[ApprovalStatus.PENDING_APPROVAL];

    return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>{text}</span>;
};


const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const DetailItem: React.FC<{label: string, value?: string}> = ({label, value}) => (
    <div className="grid grid-cols-3 gap-4">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="text-sm text-slate-900 dark:text-slate-100 col-span-2">{value || '-'}</dd>
    </div>
);

const SellerDetailModal: React.FC<{ seller: User; onClose: () => void; onApprove: (userId: string) => void; }> = ({ seller, onClose, onApprove }) => {
    const info = seller.sellerInfo;
    if (!info) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{info.companyName}</h2>
                           <p className="text-sm text-slate-500 dark:text-slate-400">{seller.name} - {seller.email}</p>
                        </div>
                        <button onClick={onClose} className="text-2xl leading-none p-1 -m-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">&times;</button>
                    </div>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <DetailSection title="Company & Legal Information">
                        <DetailItem label="GST Number" value={info.gstNumber} />
                        <DetailItem label="CID Number" value={info.cidNumber} />
                        <DetailItem label="PAN Number" value={info.panNumber} />
                    </DetailSection>

                    <DetailSection title="Contact Details">
                        <DetailItem label="Phone Number" value={info.phoneNumber} />
                    </DetailSection>

                    <DetailSection title="Registered Address">
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                            {info.address.street}<br/>
                            {info.address.city}, {info.address.state} - {info.address.zip}<br/>
                            {info.address.country}
                        </p>
                    </DetailSection>

                    <DetailSection title="Submitted Documents">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#" onClick={e=>e.preventDefault()} className="flex-1 p-3 border dark:border-slate-700 rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <DocumentIcon className="w-6 h-6 text-primary-500"/>
                                <div>
                                    <p className="font-semibold">Company PAN</p>
                                    <p className="text-xs text-slate-500">{info.documents.companyPan}</p>
                                </div>
                            </a>
                             <a href="#" onClick={e=>e.preventDefault()} className="flex-1 p-3 border dark:border-slate-700 rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <DocumentIcon className="w-6 h-6 text-primary-500"/>
                                <div>
                                    <p className="font-semibold">Other Documents</p>
                                    <p className="text-xs text-slate-500">{info.documents.other}</p>
                                </div>
                            </a>
                        </div>
                    </DetailSection>

                    <DetailSection title="Proposed Product Line">
                        <pre className="text-sm whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border dark:border-slate-700">{info.productList}</pre>
                    </DetailSection>
                </div>
                 <div className="p-6 border-t dark:border-slate-700 shrink-0 flex justify-end gap-4 bg-slate-50 dark:bg-slate-800/50">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold text-sm rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Close</button>
                    <button onClick={() => onApprove(seller.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold text-sm rounded-md hover:bg-green-600"> <CheckCircleIcon className="w-5 h-5" /> Approve Seller</button>
                 </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
