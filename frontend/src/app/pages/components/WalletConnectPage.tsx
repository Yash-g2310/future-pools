'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { Connector } from 'wagmi';

interface WalletConnectPageProps {
  onWalletConnected: () => void;
}

interface WalletDisplayProps {
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  onDisconnect: () => void;
}

// Separate component for connected wallet display
const ConnectedWalletDisplay = ({ address, chainId, onDisconnect }: WalletDisplayProps) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-4">
      {/* Blue connected wallet section with disconnect button */}
      <div className="flex flex-col gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-800 font-medium">Connected Wallet</p>
              <p className="text-blue-600 text-sm mt-1">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </p>
            </div>
            <button
              onClick={onDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm 
                       transition-colors duration-200 flex items-center gap-1"
            >
              <span>Disconnect</span>
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing green status section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <p className="text-green-800 font-medium">Wallet Connected!</p>
          <button 
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          >
            View on Etherscan ↗
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-green-600 text-sm">
            Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => navigator.clipboard.writeText(address || '')}
          >
            Copy 📋
          </button>
        </div>
        <p className="text-green-600 text-xs mt-1">Chain ID: {chainId}</p>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={onDisconnect}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg 
                   hover:bg-red-700 transition-colors font-medium"
        >
          Disconnect Wallet
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg 
                   hover:bg-gray-300 transition-colors font-medium"
        >
          Refresh Connection
        </button>
      </div>
    </div>
  </div>
);

// Separate component for wallet connector buttons
const WalletConnectorButton = ({
  connector,
  isPending,
  onClick,
}: {
  connector: Connector;
  isPending: boolean;
  onClick: () => void;
}) => {
  const getWalletIcon = (walletName: string) => {
    switch (walletName) {
      case 'MetaMask':
        return '🦊';
      case 'WalletConnect':
        return '📱';
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed 
                transition-colors font-medium flex items-center justify-center gap-2"
    >
      {getWalletIcon(connector.name)}
      {connector.name}
    </button>
  );
};

export default function WalletConnectPage({ onWalletConnected }: WalletConnectPageProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      const timer = setTimeout(onWalletConnected, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, onWalletConnected]);

  const handleConnect = useCallback(async (connector: Connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect]);

  if (!hasMounted) return null;

  if (isConnected) {
    return (
      <ConnectedWalletDisplay
        address={address}
        chainId={chainId}
        onDisconnect={disconnect}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Connect Your Wallet</h1>
        <p className="text-gray-600 text-center mb-6">
          Please connect your wallet to continue with passport verification
        </p>
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <WalletConnectorButton
              key={connector.id}
              connector={connector}
              isPending={isPending}
              onClick={() => handleConnect(connector)}
            />
          ))}
        </div>

        {connectors.length === 0 && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">No wallet connectors available</p>
            <p className="text-sm text-gray-500">
              Please install a Web3 wallet like MetaMask or use a supported browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
