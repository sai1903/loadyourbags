
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, Address } from '../types';
import apiService from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signUp: (signUpData: Omit<User, 'id' | 'role' | 'avatar' >) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isProductInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  updateUserAddresses: (addresses: Address[]) => Promise<void>;
  checkIfPurchased: (productId: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to check session

  // On initial app load, check for a stored token to re-authenticate the user
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const currentUser = await apiService.getMe();
          setUser(currentUser);
        } catch (error) {
          console.error("Session check failed, clearing token.", error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkUserSession();
  }, []);


  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { accessToken, user: loggedInUser } = await apiService.login(email, password);
      localStorage.setItem('authToken', accessToken);
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Re-throw to allow UI to handle it
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const signUp = useCallback(async (signUpData: Omit<User, 'id' | 'role' | 'avatar' >) => {
    setIsLoading(true);
    try {
      const { accessToken, user: signedUpUser } = await apiService.signUp(signUpData);
      localStorage.setItem('authToken', accessToken);
      setUser(signedUpUser);
    } catch (error) {
      console.error("Sign up failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
     // Navigate to home or signin page after logout is handled in the component
  }, []);
  
  const isProductInWishlist = useCallback((productId: string) => {
      return user?.wishlist?.includes(productId) ?? false;
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    
    const oldWishlist = user.wishlist || [];
    // Optimistic UI update for better user experience
    const newWishlist = oldWishlist.includes(productId)
        ? oldWishlist.filter(id => id !== productId)
        : [...oldWishlist, productId];
    setUser(currentUser => currentUser ? { ...currentUser, wishlist: newWishlist } : null);

    try {
        // Sync with backend and update user state with the source of truth
        const updatedUser = await apiService.toggleWishlist(productId);
        setUser(updatedUser);
    } catch (error) {
        console.error("Failed to update wishlist:", error);
        // Revert on failure
        setUser(currentUser => currentUser ? { ...currentUser, wishlist: oldWishlist } : null);
    }
  }, [user]);

  const updateUserAddresses = useCallback(async (addresses: Address[]) => {
      if (!user) return;
      
      const oldAddresses = user.addresses || [];
      setUser(currentUser => currentUser ? { ...currentUser, addresses: addresses } : null); // Optimistic update
      
      try {
          const updatedAddresses = await apiService.updateUserAddresses(addresses);
          setUser(currentUser => currentUser ? { ...currentUser, addresses: updatedAddresses } : null);
      } catch (error) {
          console.error("Failed to update addresses:", error);
          setUser(currentUser => currentUser ? { ...currentUser, addresses: oldAddresses } : null); // Revert
          throw error;
      }
  }, [user]);

  const checkIfPurchased = useCallback((productId: string) => {
      return user?.purchasedProductIds?.includes(productId) ?? false;
  }, [user]);


  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signUp,
    isLoading,
    isProductInWishlist,
    toggleWishlist,
    updateUserAddresses,
    checkIfPurchased,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
