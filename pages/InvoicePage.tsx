
import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Order, Product, User } from '../types';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBagIcon, DocumentArrowDownIcon } from '../components/Icons';
import { numberToWords } from '../utils/numberToWords';

// Extend the Window interface to inform TypeScript about the CDN-loaded libraries
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface InvoiceData {
    order: Order;
    products: Product[];
    seller: User;
    customer: User;
}

const InvoicePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user: customer } = useAuth();
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (!orderId || !customer) {
                setError("Missing required data to generate invoice.");
                setIsLoading(false);
                return;
            }
            try {
                const order = await apiService.fetchOrderById(orderId);
                if (!order) {
                    throw new Error("Order not found.");
                }

                const productIds = order.items.map(item => item.productId);
                const products = await apiService.fetchProductsByIds(productIds);
                if (products.length === 0) {
                     throw new Error("Could not retrieve product details for this order.");
                }
                
                // Assuming all items from one seller for this invoice format
                const sellerId = products[0].sellerId;
                const seller = await apiService.fetchUserById(sellerId);
                if (!seller) {
                    throw new Error("Could not retrieve seller details for this order.");
                }
                
                setInvoiceData({ order, products, seller, customer });
            } catch (e) {
                setError(e instanceof Error ? e.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoiceData();
    }, [orderId, customer]);

    const handleDownloadPdf = () => {
        const input = document.getElementById('invoice-content');
        if (!input) return;

        // Explicitly access CDN libraries from the 'window' object to avoid ReferenceError.
        window.html2canvas(input, { scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            // The jspdf UMD module attaches an object to window.jspdf, which contains the jsPDF constructor.
            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, width, Math.min(height, pdfHeight));
            pdf.save(`invoice-${invoiceData?.order.id}.pdf`);
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                <p className="ml-4">Generating Invoice...</p>
            </div>
        );
    }

    if (error || !invoiceData) {
        return <div className="text-center text-red-500 py-10">{error || "Could not load invoice data."}</div>;
    }
    
    const { order, products, seller, customer: currentCustomer } = invoiceData;
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = order.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        const discount = (product?.mrp || item.price) - item.price;
        return sum + (discount * item.quantity);
    }, 0);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Invoice</h1>
                <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold text-sm rounded-md hover:bg-primary-700 shadow-sm"
                >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            <div id="invoice-content" className="p-8 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 shadow-lg rounded-lg border dark:border-slate-700">
                <header className="flex justify-between items-start pb-4 border-b dark:border-slate-600">
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="h-8 w-8 text-primary-600"/>
                        <span className="text-2xl font-bold">Load Your Bags</span>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase">Order Invoice</h2>
                        <p className="text-sm">Invoice # {order.id.slice(-10)}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Recipient (Seller)</h3>
                        <p className="font-bold text-lg">{seller.sellerInfo?.companyName || seller.name}</p>
                        <p className="text-sm">{seller.sellerInfo?.address.street}</p>
                        <p className="text-sm">{seller.sellerInfo?.address.city}, {seller.sellerInfo?.address.state} {seller.sellerInfo?.address.zip}</p>
                        <p className="text-sm">PAN: {seller.sellerInfo?.panNumber}</p>
                    </div>
                     <div className="text-right">
                        <h3 className="font-semibold text-slate-500 dark:text-slate-400">Order Details</h3>
                        <p className="text-sm"><span className="font-semibold">Order ID:</span> {order.id}</p>
                        <p className="text-sm"><span className="font-semibold">Order Date:</span> {new Date(order.date).toLocaleString()}</p>
                     </div>
                </section>
                
                 <section className="my-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <h3 className="font-semibold text-slate-500 dark:text-slate-400">Sold To</h3>
                    <p className="font-bold">{currentCustomer.name}</p>
                    <p className="text-sm">{order.shippingAddress.street}</p>
                    <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                 </section>

                <section className="my-6">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-500 dark:border-slate-400">
                            <tr>
                                <th className="py-2">Qty</th>
                                <th className="py-2">Product</th>
                                <th className="py-2 text-right">Gross Amount</th>
                                <th className="py-2 text-right">Discount</th>
                                <th className="py-2 text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                        {order.items.map(item => {
                             const product = products.find(p => p.id === item.productId);
                             const grossAmount = (product?.mrp || item.price) * item.quantity;
                             const discount = grossAmount - (item.price * item.quantity);
                             const lineTotal = item.price * item.quantity;
                             return (
                                <tr key={item.productId} className="border-b dark:border-slate-700">
                                    <td className="py-3">{item.quantity}</td>
                                    <td className="py-3">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-xs text-slate-500">{product?.category}</p>
                                    </td>
                                    <td className="py-3 text-right">₹{grossAmount.toFixed(2)}</td>
                                    <td className="py-3 text-right">-₹{discount.toFixed(2)}</td>
                                    <td className="py-3 text-right">₹{lineTotal.toFixed(2)}</td>
                                </tr>
                             )
                        })}
                        </tbody>
                    </table>
                </section>
                
                <section className="flex justify-end my-6">
                    <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between">
                            <span>Total Discount</span>
                            <span>-₹{totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sub Total</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl border-t-2 border-slate-500 dark:border-slate-400 pt-2">
                            <span>Total</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <section className="my-6 font-bold">
                    <p>Total (in words): {numberToWords(subtotal)}</p>
                </section>

                <footer className="pt-6 border-t dark:border-slate-600 text-sm">
                    <p className="text-center font-semibold">Thank you for shopping at Load Your Bags!</p>
                    <p className="text-center text-xs text-slate-500">Load Your Bags Pvt. Ltd., Bengaluru, Karnataka</p>
                    <div className="flex justify-between mt-16">
                        <p className="border-t-2 border-slate-400 px-4">Recipient's Signature</p>
                        <p className="border-t-2 border-slate-400 px-4">Authorized Signature</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default InvoicePage;
