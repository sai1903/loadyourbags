
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { CreditCardIcon, UpiIcon, QrCodeIcon, BanknotesIcon, CheckCircleIcon } from '../components/Icons';

type PaymentMethod = 'UPI' | 'QR' | 'CARD' | 'COD';

const PaymentMethodButton: React.FC<{
    method: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    selectedMethod: PaymentMethod;
    setSelectedMethod: (method: PaymentMethod) => void;
}> = ({ method, label, icon, selectedMethod, setSelectedMethod }) => {
    const isSelected = selectedMethod === method;
    return (
        <button
            onClick={() => setSelectedMethod(method)}
            className={`flex items-center gap-3 w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected 
                ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-500 shadow-md' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
        >
            {icon}
            <span className={`font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-200' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
            {isSelected && <CheckCircleIcon className="w-6 h-6 text-primary-500 ml-auto" />}
        </button>
    );
};

const CardForm: React.FC = () => (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8"/>
            <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" alt="Mastercard" className="h-8"/>
            <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="Rupay" className="h-8"/>
        </div>
        <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Card Number</label>
            <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
        </div>
        <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cardholder Name</label>
            <input type="text" id="cardName" placeholder="John Doe" className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
        </div>
        <div className="flex gap-4">
            <div className="flex-1">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</label>
                <input type="text" id="expiryDate" placeholder="MM/YY" className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
            </div>
            <div className="flex-1">
                <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 dark:text-slate-300">CVV</label>
                <input type="text" id="cvv" placeholder="123" className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
            </div>
        </div>
    </div>
);

const UpiForm: React.FC = () => (
    <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter UPI ID</label>
        <div className="flex gap-2 mt-1">
            <input type="text" id="upiId" placeholder="yourname@bank" className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md" />
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Verify</button>
        </div>
    </div>
);

const QrDisplay: React.FC = () => (
    <div className="text-center">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi" alt="UPI QR Code" className="mx-auto rounded-lg border-4 border-white dark:border-slate-700" />
        <p className="mt-4 font-semibold">Scan with any UPI app</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Google Pay, PhonePe, Paytm, and more</p>
    </div>
);

const CodInfo: React.FC = () => (
    <div className="text-center p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <p className="font-semibold">Pay on Delivery</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">You can pay with cash or UPI when your order is delivered.</p>
    </div>
);


const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart, items } = useCart();
    const { user } = useAuth();
    
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARD');
    const [isProcessing, setIsProcessing] = useState(false);

    const { purchaseSubtotal, trialShippingFee, totalShippingFee, totalGst, grandTotal } = location.state || {};
    
    useEffect(() => {
        if (!location.state || grandTotal === undefined) {
            navigate('/cart', { replace: true });
        }
    }, [location.state, grandTotal, navigate]);
    
    if (grandTotal === undefined) {
        return null; // or a loader, while redirecting
    }

    const handlePayment = async () => {
        setIsProcessing(true);

        if (!user) {
            alert("You must be logged in to place an order.");
            setIsProcessing(false);
            navigate('/signin');
            return;
        }

        const shippingAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];

        if (!shippingAddress) {
            alert("Please add a shipping address to your profile before checking out.");
            setIsProcessing(false);
            navigate('/addresses');
            return;
        }

        // Determine if the order is purely for trial items
        const isPurelyTrial = items.length > 0 && items.every(i => i.purchaseType === 'trial');
        
        try {
            // Use the API to create and persist the order
            const newOrder = await apiService.createOrder({
                userId: user.id,
                items: items,
                total: grandTotal,
                shippingAddress: shippingAddress,
                isTrialOrder: isPurelyTrial
            });

            // Simulate payment processing time
            setTimeout(() => {
                clearCart();
                navigate('/order-success', {
                    state: {
                        orderId: newOrder.id, // Use the ID from the created order
                        total: newOrder.total,
                        items: newOrder.items,
                        paymentMethod: selectedMethod,
                    },
                    replace: true,
                });
            }, 1500);

        } catch (error) {
            console.error("Failed to create order:", error);
            alert("There was an error placing your order. Please try again.");
            setIsProcessing(false);
        }
    };
    
    const payButtonText = isProcessing ? 'Processing...' : (selectedMethod === 'COD' ? 'Place Order' : `Pay ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Payment</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
                    <div className="space-y-3">
                         <PaymentMethodButton method="CARD" label="Credit/Debit Card" icon={<CreditCardIcon className="w-6 h-6" />} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} />
                         <PaymentMethodButton method="UPI" label="UPI" icon={<UpiIcon className="w-6 h-6" />} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} />
                         <PaymentMethodButton method="QR" label="Scan QR" icon={<QrCodeIcon className="w-6 h-6" />} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} />
                         <PaymentMethodButton method="COD" label="Cash on Delivery" icon={<BanknotesIcon className="w-6 h-6" />} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} />
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        {selectedMethod === 'CARD' && <CardForm />}
                        {selectedMethod === 'UPI' && <UpiForm />}
                        {selectedMethod === 'QR' && <QrDisplay />}
                        {selectedMethod === 'COD' && <CodInfo />}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span>Subtotal</span><span>₹{purchaseSubtotal.toLocaleString('en-IN')}</span></div>
                            {trialShippingFee > 0 && <div className="flex justify-between"><span>Trial Fee</span><span>₹{trialShippingFee.toLocaleString('en-IN')}</span></div>}
                            <div className="flex justify-between"><span>Shipping</span><span>₹{totalShippingFee.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between">
                                <span>GST</span>
                                <span>₹{(totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <span>Amount Payable</span><span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                            {payButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
