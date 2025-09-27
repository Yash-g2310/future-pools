'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnectPage from './components/WalletConnectPage';
import QRVerificationPage from './components/QRVerificationPage';

type AppPage = 'wallet-connect' | 'qr-verification';

// function ConnectWallet() {
//   const { isConnected } = useAccount();
//   if (isConnected) return <Account />
//   return <WalletOptions />
// }

export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('wallet-connect');
  const { isConnected } = useAccount();

  const handleWalletConnected = () => {
    setCurrentPage('qr-verification');
  };

  const handleBackToWallet = () => {
    setCurrentPage('wallet-connect');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'wallet-connect':
        return <WalletConnectPage onWalletConnected={handleWalletConnected} />;
      case 'qr-verification':
        return (
          <QRVerificationPage
            onBackToWallet={handleBackToWallet}
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
