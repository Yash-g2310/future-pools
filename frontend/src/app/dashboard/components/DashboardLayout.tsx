'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  // Check if the user is verified and connected
  useEffect(() => {
    // Check if client-side
    if (typeof window !== 'undefined') {
      const isVerified = localStorage.getItem('user_verified') === 'true';
      
      if (!isConnected || !isVerified) {
        // Clear verification status
        localStorage.removeItem('user_verified');
        
        // If wallet is connected but not verified, disconnect it
        if (isConnected && !isVerified) {
          disconnect();
        }
        
        // Redirect to home page
        router.push('/');
      }
    }
  }, [isConnected, router, disconnect]);

  // Don't render anything if not connected or verified
  if (typeof window !== 'undefined') {
    const isVerified = localStorage.getItem('user_verified') === 'true';
    if (!isConnected || !isVerified) {
      return null;
    }
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;