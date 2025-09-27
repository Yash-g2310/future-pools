import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import WalletOptions from '../components/wallet-options';
import Account from '../components/account';

export default function WalletConnectPage({ onWalletConnected }) {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      onWalletConnected();
      router.push('/dashboard'); // Redirect to the dashboard on successful connection
    }
  }, [isConnected, onWalletConnected, router]);

  return (
    <div className="min-h-screen bg-[#1a1d2e] text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
      {isConnected ? <Account /> : <WalletOptions />}
    </div>
  );
}