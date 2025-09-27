'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnectPage from './pages/components/WalletConnectPage';
import QRVerificationPage from './pages/components/QRVerificationPage';

type AppPage = 'wallet-connect' | 'qr-verification' | 'next-step';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('wallet-connect');
  const { isConnected } = useAccount();

  const handleWalletConnected = () => {
    setCurrentPage('qr-verification');
  };

  const handleBackToWallet = () => {
    setCurrentPage('wallet-connect');
  };

  const handleVerificationComplete = () => {
    setCurrentPage('next-step');
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
          />
        );
      
      case 'next-step':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
              <h1 className="text-3xl font-bold mb-6">Verification Complete!</h1>
              <p className="text-gray-600 mb-6">
                Your passport has been successfully verified. 
                You can now proceed with the next steps in your application flow.
              </p>
              <button
                onClick={handleBackToWallet}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
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