'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { SelfAppBuilder } from '@selfxyz/qrcode';

interface QRVerificationPageProps {
  onVerificationComplete?: () => void;
  onBackToWallet?: () => void;
}

export default function QRVerificationPage({ 
  onVerificationComplete, 
  onBackToWallet 
}: QRVerificationPageProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [selfApp, setSelfApp] = useState<any | null>(null);

  // Initialize Self Protocol
  useEffect(() => {
    if (isConnected && address) {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Futures Pool',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'human-blacklist-scope',
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '0x3e2aa34c333474e3692abfb7a3f97a44173d0401' ,
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: address,
        endpointType: 'staging_celo',
        userIdType: 'hex',
        userDefinedData: 'Passport Verification for address: ' + address,
        disclosures: {
          minimumAge: 18,
          excludedCountries: [
            countries.UNITED_STATES
          ],
          ofac: false, 
          passport_number: true,
        },
      }).build();

      setSelfApp(app);
    }
  }, [isConnected, address]);

  const handleVerificationSuccess = () => {
    onVerificationComplete?.();
  };

  const handleVerificationError = () => {
    console.error('Verification failed');
  };

  const handleDisconnect = () => {
    disconnect();
    onBackToWallet?.();
  };

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet first to proceed with verification.</p>
          <button
            onClick={onBackToWallet}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Wallet Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Passport Verification</h1>
        
        <div className="space-y-6">
          {/* Connected Wallet Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-800 font-medium">Connected Wallet</p>
                <p className="text-blue-600 text-sm mt-1">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm 
                         transition-colors duration-200 flex items-center gap-1"
              >
                <span>Disconnect</span>
                <span className="text-xs">×</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code for Verification</h2>
            
            {!selfApp ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Initializing verification...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                />
                <p className="text-sm text-gray-600">
                  Use your mobile device to scan this QR code for passport verification
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onBackToWallet}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
