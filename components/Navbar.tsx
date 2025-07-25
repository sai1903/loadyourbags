
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { UserRole, Address } from '../types';
import { SunIcon, MoonIcon, UserCircleIcon, ShoppingBagIcon, SearchIcon, MapPinIcon, CheckCircleIcon } from './Icons';
import apiService from '../services/apiService';

const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-500 text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`
    }
  >
    {children}
  </NavLink>
);

const DropdownLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void; }> = ({ to, children, onClick }) => (
     <NavLink
        to={to}
        onClick={onClick}
        className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
        {children}
    </NavLink>
);

const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
        </button>
    );
};

const LocationDisplay: React.FC = () => {
  const { user, updateUserAddresses } = useAuth();
  const [location, setLocation] = useState<Partial<Address> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showErrorHelp, setShowErrorHelp] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = await apiService.reverseGeocode(latitude, longitude);
            setLocation(locationData);
            setError(null);
          } catch (apiError) {
            console.error("Reverse geocoding failed", apiError);
            setError("Could not fetch location name.");
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("Location access denied.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Location unavailable.");
              break;
            case err.TIMEOUT:
              setError("Location request timed out.");
              break;
            default:
              setError("An unknown error occurred.");
              break;
          }
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported.");
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
      if (user?.addresses && location?.street && location?.zip) {
          const alreadyExists = user.addresses.some(addr => 
              addr.street === location.street && addr.zip === location.zip
          );
          setIsSaved(alreadyExists);
      }
  }, [user, location]);
  
  const handleSaveAddress = async () => {
    if (!user || !location || !location.street) return;

    setIsSaving(true);
    const newAddress: Address = {
        id: `addr_${Date.now()}`,
        street: location.street || '',
        city: location.city || '',
        state: location.state || '',
        zip: location.zip || '',
        country: location.country || 'USA',
        isDefault: !user.addresses || user.addresses.length === 0
    };

    const updatedAddresses = [...(user.addresses || []), newAddress];

    try {
        await updateUserAddresses(updatedAddresses);
        setIsSaved(true);
    } catch (error) {
        console.error("Failed to save address:", error);
        alert("Error saving address.");
    } finally {
        setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-500"></div>
        <span className="hidden sm:inline">Finding location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1.5" title={error}>
            <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
              <MapPinIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{error}</span>
            </div>
            <button 
              onClick={() => setShowErrorHelp(p => !p)} 
              className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 w-4 h-4 rounded-full flex items-center justify-center font-mono hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none ring-1 ring-slate-300 dark:ring-slate-600"
              aria-label="Why am I seeing this?"
            >
              ?
            </button>
        </div>

        {showErrorHelp && (
            <div className="absolute top-full mt-2 -right-4 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3 text-sm text-slate-700 dark:text-slate-200 z-20">
                <p className="font-bold mb-1">Location Help</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">We request location access to show you accurate delivery information.</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">To enable, please update location permissions for this site in your browser's settings.</p>
                <button onClick={() => setShowErrorHelp(false)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-2 w-full text-right hover:underline">
                    Got it
                </button>
            </div>
        )}
      </div>
    );
  }

  if (location) {
     const displayAddress = location.street ? `${location.street}, ${location.city}` : `${location.city}, ${location.state}`;
    return (
       <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 cursor-default">
            <MapPinIcon className="w-5 h-5 flex-shrink-0" />
            <div className="hidden md:flex flex-col items-start -space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Deliver to</span>
              <span className="font-semibold truncate max-w-[150px]" title={displayAddress}>{displayAddress}</span>
            </div>
        </div>
        {user?.role === UserRole.CUSTOMER && location.street && (
             <div className="w-20 flex items-center justify-center">
             {isSaved ? (
                 <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                     <CheckCircleIcon className="w-5 h-5" />
                     Saved
                 </div>
             ) : (
                 <button
                     onClick={handleSaveAddress}
                     disabled={isSaving}
                     className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900 transition-colors disabled:opacity-50"
                 >
                     {isSaving ? 'Saving...' : 'Save'}
                 </button>
             )}
            </div>
        )}
      </div>
    );
  }

  return null;
};


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('q') || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync input with URL search param
  useEffect(() => {
      setLocalSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedSearch = localSearchTerm.trim();
      if (trimmedSearch) {
          navigate(`/?q=${encodeURIComponent(trimmedSearch)}`);
      } else {
          // If search is cleared, navigate to home without query
          navigate('/');
      }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <ShoppingBagIcon className="h-8 w-8 text-primary-600"/>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">Load Your Bags</span>
            </NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <NavItem to="/">Home</NavItem>
                {user?.role === UserRole.ADMIN && <NavItem to="/admin/dashboard">Admin Panel</NavItem>}
                {user?.role === UserRole.SELLER && <NavItem to="/seller/dashboard">Seller Panel</NavItem>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search Bar */}
             <div className="flex-1 max-w-xs hidden lg:block">
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                        placeholder="Search products..."
                        type="search"
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        aria-label="Search products"
                    />
                </form>
            </div>

            <LocationDisplay />
            <DarkModeToggle />
             <NavLink to="/cart" className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Shopping Cart">
                <ShoppingBagIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {cartCount}
                    </span>
                )}
            </NavLink>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                 <button 
                    onClick={() => setIsDropdownOpen(prev => !prev)} 
                    className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-primary-500"
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                 >
                    <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full"/>
                 </button>

                 {isDropdownOpen && (
                    <div 
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                    >
                        <div className="px-4 py-3 border-b dark:border-slate-600">
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Signed in as</p>
                            <p className="font-bold truncate text-slate-900 dark:text-white">{user.name}</p>
                        </div>
                        {user.role === UserRole.CUSTOMER && (
                            <div className='py-1' role="none">
                                <DropdownLink to="/orders" onClick={() => setIsDropdownOpen(false)}>Order History</DropdownLink>
                                <DropdownLink to="/my-trials" onClick={() => setIsDropdownOpen(false)}>Trial History</DropdownLink>
                                <DropdownLink to="/wishlist" onClick={() => setIsDropdownOpen(false)}>My Wishlist</DropdownLink>
                                <DropdownLink to="/addresses" onClick={() => setIsDropdownOpen(false)}>Saved Addresses</DropdownLink>
                            </div>
                        )}
                        {user.role === UserRole.CUSTOMER && (
                            <div className="py-1 border-t dark:border-slate-600" role="none">
                                <DropdownLink to="/returns" onClick={() => setIsDropdownOpen(false)}>Request a Return</DropdownLink>
                            </div>
                         )}
                        <div className="py-1 border-t dark:border-slate-600" role="none">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                role="menuitem"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
              </div>
            ) : (
                <NavItem to="/signin">
                    <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-6 h-6"/>
                        <span>Login</span>
                    </div>
                </NavItem>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
