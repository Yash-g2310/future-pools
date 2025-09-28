'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import DashboardHeader from './DashboardHeader';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [userVerified, setUserVerified, isLoaded] = useLocalStorage('user_verified', null);

  // Check if the user is verified and connected
  useEffect(() => {
    // Only run after localStorage is loaded to prevent hydration errors
    if (isLoaded) {
      const isVerified = userVerified === 'true';
      
      if (!isConnected || !isVerified) {
        // Clear verification status
        setUserVerified(null);
        
        // If wallet is connected but not verified, disconnect it
        if (isConnected && !isVerified) {
          disconnect();
        }
        
        // Redirect to home page
        router.push('/');
      }
    }
  }, [isConnected, userVerified, isLoaded, router, disconnect, setUserVerified]);

  // Don't render anything if localStorage is not loaded yet or if not connected/verified
  if (!isLoaded) {
    // Show loading state while localStorage is being checked
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const isVerified = userVerified === 'true';

  if (!isConnected || !isVerified) {
    // Don't render the dashboard if not properly authenticated
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;