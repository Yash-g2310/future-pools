import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import WalletConnectPage from './auth/components/WalletConnectPage';
import QRVerificationPage from './auth/components/QRVerificationPage';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen">
      {!isConnected ? (
        <WalletConnectPage onWalletConnected={() => {}} />
      ) : (
        <QRVerificationPage onVerificationComplete={() => router.push('/dashboard')} />
      )}
    </div>
  );
}