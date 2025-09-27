'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import WalletConnectPage from './components/WalletConnectPage';
import QRVerificationPage from './components/QRVerificationPage';

type AppPage = 'wallet-connect' | 'qr-verification';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('wallet-connect');
  const { isConnected } = useAccount();
  const router = useRouter();

  // Check if user is already verified on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isVerified = localStorage.getItem('user_verified') === 'true';
      if (isConnected && isVerified) {
        // User is already verified, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isConnected, router]);

  const handleWalletConnected = () => {
    setCurrentPage('qr-verification');
  };

  const handleBackToWallet = () => {
    setCurrentPage('wallet-connect');
  };

  const handleVerificationComplete = () => {
    console.log('Verification complete, navigating to dashboard');
    // Store verification status in localStorage
    localStorage.setItem('user_verified', 'true');
    // Navigate to dashboard
    router.push('/dashboard');
  };

  const handleVerificationError = () => {
    console.error('Verification error, resetting to wallet connect');
    // Reset to wallet connect on verification failure
    setCurrentPage('wallet-connect');
    // Clear any partial verification state
    localStorage.removeItem('user_verified');
  };

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