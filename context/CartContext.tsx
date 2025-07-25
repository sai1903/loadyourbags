
import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Product, CartItem } from '../types';
import apiService from '../services/apiService';

const TRIAL_SHIPPING_FEE = 799;

interface GstInfo {
    category: string;
    rate: number; // e.g., 18 for 18%
    amount: number;
}

interface GstDetails {
    gstBreakdown: GstInfo[];
    totalGst: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, purchaseType?: 'buy' | 'trial') => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isProductInCart: (productId: string) => boolean;
  cartCount: number;
  purchaseSubtotal: number;
  trialShippingFee: number;
  subtotalWithTrialFee: number;
  gstDetails: GstDetails;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [gstRates, setGstRates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadGstRates = async () => {
        try {
            const ratesData = await apiService.fetchGstRates();
            const ratesMap = new Map(ratesData.map(item => [item.category, item.rate]));
            setGstRates(ratesMap);
        } catch (error) {
            console.error("Failed to load GST rates", error);
        }
    };
    loadGstRates();
  }, []);

  const isProductInCart = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const addToCart = useCallback((product: Product, purchaseType: 'buy' | 'trial' = 'buy') => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
          if (existingItem.purchaseType === 'buy' && purchaseType === 'buy') {
               return prevItems.map(item =>
                  item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
          } else {
              alert("This product is already in your cart. You can only have one instance of each product, either for purchase or for trial.");
              return prevItems;
          }
      }
      
      return [...prevItems, { ...product, quantity: 1, purchaseType }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.id === productId);
        // Trial items cannot have their quantity changed from cart page
        if (itemToUpdate?.purchaseType === 'trial') {
            return prevItems;
        }

        if (quantity <= 0) {
            return prevItems.filter(item => item.id !== productId);
        }

        return prevItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const purchaseSubtotal = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.purchaseType === 'buy') {
        return total + item.retailPrice * item.quantity;
      }
      return total;
    }, 0);
  }, [items]);

  const trialShippingFee = useMemo(() => {
      return items.some(item => item.purchaseType === 'trial') ? TRIAL_SHIPPING_FEE : 0;
  }, [items]);
  
  const subtotalWithTrialFee = useMemo(() => {
      return purchaseSubtotal + trialShippingFee;
  }, [purchaseSubtotal, trialShippingFee]);

  const gstDetails = useMemo<GstDetails>(() => {
        const gstByCategory = new Map<string, { totalGst: number, rate: number }>();
        if (gstRates.size === 0) return { gstBreakdown: [], totalGst: 0 };

        items.forEach(item => {
            if (item.purchaseType === 'buy') {
                const rate = gstRates.get(item.category) || gstRates.get('Default') || 0;
                if (rate > 0) {
                    const itemTotal = item.retailPrice * item.quantity;
                    const itemGst = itemTotal * rate;
                    
                    const currentGst = gstByCategory.get(item.category) || { totalGst: 0, rate };
                    currentGst.totalGst += itemGst;
                    gstByCategory.set(item.category, currentGst);
                }
            }
        });
        
        const gstBreakdown: GstInfo[] = Array.from(gstByCategory.entries()).map(([category, data]) => ({
            category,
            rate: data.rate * 100,
            amount: data.totalGst,
        }));
        
        const totalGst = gstBreakdown.reduce((sum, item) => sum + item.amount, 0);

        return { gstBreakdown, totalGst };
    }, [items, gstRates]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isProductInCart,
    cartCount,
    purchaseSubtotal,
    trialShippingFee,
    subtotalWithTrialFee,
    gstDetails,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
