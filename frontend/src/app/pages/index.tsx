'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import WalletConnectPage from './components/WalletConnectPage';
import QRVerificationPage from './components/QRVerificationPage';
import { useLocalStorage } from '../hooks/useLocalStorage';

type AppPage = 'wallet-connect' | 'qr-verification';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('wallet-connect');
  const { isConnected } = useAccount();
  const router = useRouter();
  const [userVerified, setUserVerified, isLoaded] = useLocalStorage('user_verified', null);

  // Check if user is already verified on mount
  useEffect(() => {
    // Only run after localStorage is loaded to prevent hydration errors
    if (isLoaded) {
      const isVerified = userVerified === 'true';
      if (isConnected && isVerified) {
        // User is already verified, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isConnected, userVerified, isLoaded, router]);

  const handleWalletConnected = () => {
    setCurrentPage('qr-verification');
  };

  const handleBackToWallet = () => {
    setCurrentPage('wallet-connect');
  };

  const handleVerificationComplete = () => {
    console.log('Verification complete, navigating to dashboard');
    // Store verification status using safe localStorage hook
    setUserVerified('true');
    // Navigate to dashboard
    router.push('/dashboard');
  };

  const handleVerificationError = () => {
    console.error('Verification error, resetting to wallet connect');
    // Reset to wallet connect on verification failure
    setCurrentPage('wallet-connect');
    // Clear any partial verification state using safe localStorage hook
    setUserVerified(null);
  };

  // Show loading state while localStorage is being checked
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'wallet-connect':
        return <WalletConnectPage onWalletConnected={handleWalletConnected} />;
      case 'qr-verification':
        return (
          <QRVerificationPage
            onVerificationComplete={handleVerificationComplete}
            onBackToWallet={handleBackToWallet}
            onVerificationError={handleVerificationError}
          />
        );
      default:
        return <WalletConnectPage onWalletConnected={handleWalletConnected} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentPage()}
    </div>
  );
}