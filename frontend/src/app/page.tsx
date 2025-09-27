'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import WalletConnectPage from './pages/components/WalletConnectPage';
import QRVerificationPage from './pages/components/QRVerificationPage';

type AppPage = 'wallet-connect' | 'qr-verification';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('wallet-connect');
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleWalletConnected = () => {
    setCurrentPage('qr-verification');
  };

  const handleBackToWallet = () => {
    setCurrentPage('wallet-connect');
  };

  // Updated to redirect to dashboard instead of showing "Start Over" page
  const handleVerificationComplete = () => {
    console.log("Verification successful, navigating to dashboard");
    // Store verification status in localStorage
    localStorage.setItem('user_verified', 'true');
    // Navigate to dashboard
    router.push('/dashboard');
  };

  const handleVerificationError = () => {
    console.error("Verification failed");
    // Clear any verification state
    localStorage.removeItem('user_verified');
    // Go back to wallet connect
    setCurrentPage('wallet-connect');
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