'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface QRVerificationPageProps {
  onVerificationComplete?: () => void;
  onBackToWallet?: () => void;
}

export default function QRVerificationPage({ 
  onVerificationComplete, 
  onBackToWallet 
}: QRVerificationPageProps) {
  const { address, isConnected } = useAccount();
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'scanning' | 'verified' | 'failed'>('pending');

  // Generate QR code data when component mounts
  useEffect(() => {
    const generateQRData = () => {
      const mockQRData = `passport-verification://verify?wallet=${address}&timestamp=${Date.now()}`;
      setQrCodeData(mockQRData);
      setIsGenerating(false);
      setVerificationStatus('scanning');
    };

    if (isConnected && address) {
      generateQRData();
    }
  }, [isConnected, address]);

  const handleVerificationSuccess = () => {
    setVerificationStatus('verified');
    setTimeout(() => {
      onVerificationComplete?.();
    }, 2000);
  };

  const handleVerificationFailure = () => {
    setVerificationStatus('failed');
  };

  const handleBackToWallet = () => {
    onBackToWallet?.();
  };

  // Redirect to wallet connect if not connected
  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet first to proceed with verification.</p>
          <button
            onClick={handleBackToWallet}
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
            <p className="text-blue-800 font-medium">Connected Wallet</p>
            <p className="text-blue-600 text-sm mt-1">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>

          {/* QR Code Section */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code for Verification</h2>
            
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Generating verification QR code...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Placeholder QR Code */}
                <div className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-8 mx-auto max-w-xs">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📱</div>
                    <p className="text-sm text-gray-600">QR Code Placeholder</p>
                    <p className="text-xs text-gray-500 mt-2 break-all">{qrCodeData}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Use your mobile device to scan this QR code for passport verification
                </p>

                {/* Verification Status */}
                {verificationStatus === 'scanning' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium">Waiting for verification...</p>
                    <p className="text-yellow-600 text-sm mt-1">
                      Please scan the QR code with your mobile device
                    </p>
                  </div>
                )}

                {verificationStatus === 'verified' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✓ Verification Successful!</p>
                    <p className="text-green-600 text-sm mt-1">
                      Your passport has been verified. Redirecting...
                    </p>
                  </div>
                )}

                {verificationStatus === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">✗ Verification Failed</p>
                    <p className="text-red-600 text-sm mt-1">
                      Please try again or contact support
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleBackToWallet}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Wallet
            </button>
            
            {verificationStatus === 'scanning' && (
              <>
                <button
                  onClick={handleVerificationSuccess}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Simulate Success
                </button>
                <button
                  onClick={handleVerificationFailure}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Simulate Failure
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
