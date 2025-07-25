
import React, { useState, useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon } from './Icons';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <CheckCircleIcon className="w-5 h-5" />
        ) : (
          <XCircleIcon className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'You are offline'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
