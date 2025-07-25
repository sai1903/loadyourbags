
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '../components/Icons';
import { CartItem } from '../types';

type ShippingInfo = {
    fee: number;
    standardDeliveryDate: string;
    expressDeliveryDate: string;
    expressFee: number;
};

const CartItemRow: React.FC<{ 
    item: CartItem; 
    shippingInfo?: ShippingInfo | null;
    isCalculating: boolean;
}> = ({ item, shippingInfo, isCalculating }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const isTrial = item.purchaseType === 'trial';

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow text-center sm:text-left">
                <NavLink to={`/product/${item.id}`} className="font-bold text-lg hover:text-primary-500 transition-colors">{item.name}</NavLink>
                {isTrial && <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">Home Trial</span>}
                <p className="text-slate-500 dark:text-slate-400 text-sm">{item.category}</p>
                
                {item.pickupAddress?.zip && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isCalculating ? (
                             <span className="animate-pulse">Calculating shipping...</span>
                        ) : shippingInfo ? (
                             shippingInfo.fee > 0 
                                ? <span>Shipping: ₹{shippingInfo.fee.toLocaleString('en-IN')} (Est. by {shippingInfo.standardDeliveryDate})</span>
                                : <span className="text-green-600 dark:text-green-400">Free Shipping</span>
                        ) : (
                             <span className="text-yellow-600 dark:text-yellow-500">Cannot calculate shipping</span>
                        )}
                    </div>
                 )}


                 <p className="text-primary-600 dark:text-primary-400 font-semibold sm:hidden mt-1">{isTrial ? '₹0' : `₹${item.retailPrice.toLocaleString('en-IN')}`}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={isTrial} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Decrease quantity">
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={isTrial} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Increase quantity">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
                <p className="font-semibold text-lg w-24 text-right hidden sm:block">
                    {isTrial ? '₹0' : `₹${(item.retailPrice * item.quantity).toLocaleString('en-IN')}`}
                </p>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors" aria-label="Remove item">
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
    );
};


const CartPage: React.FC = () => {
  const { items, purchaseSubtotal, trialShippingFee, cartCount, subtotalWithTrialFee, gstDetails } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingCosts, setShippingCosts] = useState<Map<string, ShippingInfo | null>>(new Map());
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.addresses) {
        const defaultAddress = user.addresses.find(a => a.isDefault);
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
        } else if (user.addresses.length > 0) {
            setSelectedAddressId(user.addresses[0].id);
        }
    }
  }, [user?.addresses]);


  const purchaseItems = useMemo(() => items.filter(i => i.purchaseType === 'buy'), [items]);
  const trialItems = useMemo(() => items.filter(i => i.purchaseType === 'trial'), [items]);
  
  const deliveryPincode = useMemo(() => {
    if (!selectedAddressId || !user?.addresses) return null;
    return user.addresses.find(a => a.id === selectedAddressId)?.zip || null;
  }, [user?.addresses, selectedAddressId]);

  useEffect(() => {
    const calculateAllShipping = async () => {
      const itemsWithPickup = purchaseItems.filter(item => item.pickupAddress?.zip);
      if (!deliveryPincode || itemsWithPickup.length === 0) {
        setShippingCosts(new Map()); // Clear costs if no pincode or no items to ship
        setIsCalculatingShipping(false);
        return;
      }

      setIsCalculatingShipping(true);
      const costs = new Map<string, ShippingInfo | null>();
      
      await Promise.all(itemsWithPickup.map(async item => {
        if (item.pickupAddress?.zip) {
            try {
                const result = await apiService.calculateShipping(item.pickupAddress.zip, deliveryPincode);
                costs.set(item.id, result);
            } catch {
                costs.set(item.id, null); // Error case
            }
        }
      }));

      setShippingCosts(costs);
      setIsCalculatingShipping(false);
    };

    calculateAllShipping();
  }, [purchaseItems, deliveryPincode]);

  const totalShippingFee = useMemo(() => {
    return Array.from(shippingCosts.values()).reduce((total, cost) => total + (cost?.fee || 0), 0);
  }, [shippingCosts]);
  
  const finalGrandTotal = useMemo(() => {
      return subtotalWithTrialFee + totalShippingFee + gstDetails.totalGst;
  }, [subtotalWithTrialFee, totalShippingFee, gstDetails.totalGst]);


  if (cartCount === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBagIcon className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600" />
        <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-200">Your Cart is Empty</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Looks like you haven't added anything to your cart yet.</p>
        <NavLink
          to="/"
          className="mt-6 inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105"
        >
          Start Shopping
        </NavLink>
      </div>
    );
  }

  const handleCheckout = () => {
      navigate('/payment', { 
        state: {
            purchaseSubtotal,
            trialShippingFee,
            totalShippingFee,
            totalGst: gstDetails.totalGst,
            grandTotal: finalGrandTotal
        }
      });
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {purchaseItems.length > 0 && (
               <div>
                  <h2 className="text-xl font-bold mb-3 text-slate-700 dark:text-slate-300">Items for Purchase</h2>
                  <div className="space-y-4">
                      {purchaseItems.map(item => (
                          <CartItemRow 
                            key={item.id} 
                            item={item} 
                            shippingInfo={shippingCosts.get(item.id)}
                            isCalculating={isCalculatingShipping && !!deliveryPincode}
                          />
                      ))}
                  </div>
               </div>
           )}
           {trialItems.length > 0 && (
               <div>
                  <h2 className="text-xl font-bold mb-3 text-slate-700 dark:text-slate-300">Items for Home Trial</h2>
                  <div className="space-y-4">
                      {trialItems.map(item => <CartItemRow key={item.id} item={item} isCalculating={false}/>)}
                  </div>
               </div>
           )}
        </div>
        <div className="lg:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                 {user?.addresses && user.addresses.length > 0 && (
                    <div className="mb-4">
                        <label htmlFor="shippingAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Shipping To:</label>
                        <select
                            id="shippingAddress"
                            value={selectedAddressId || ''}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            {user.addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.street}, {addr.city}
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal ({purchaseItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                        <span>₹{purchaseSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                     {trialShippingFee > 0 && (
                        <div className="flex justify-between">
                            <span>Trial Shipping Fee</span>
                            <span>₹{trialShippingFee.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping Fees</span>
                        <span>
                            {isCalculatingShipping && !!deliveryPincode ? 'Calculating...' : `₹${totalShippingFee.toLocaleString('en-IN')}`}
                        </span>
                    </div>
                     <div className="flex justify-between">
                        <span>GST</span>
                        <span>₹{gstDetails.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {user && (!user.addresses || user.addresses.length === 0) && purchaseItems.some(i => i.pickupAddress) && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center pt-2">
                            Please <NavLink to="/addresses" className="underline font-semibold">add a shipping address</NavLink> to calculate fees.
                        </p>
                    )}
                    
                     <div className="flex justify-between font-bold text-lg border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                        <span>Grand Total</span>
                        <span>₹{finalGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <button 
                    onClick={handleCheckout} 
                    className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800"
                    disabled={!user}
                >
                    {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
