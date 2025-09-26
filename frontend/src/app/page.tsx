'use client';

import { useState } from 'react';
import { Web3Providers } from './providers/Web3Providers';
import PassportVerification from './components/PassportVerification';
import { VerificationResult } from './hooks/useSelfVerification';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function MainContent() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleVerificationComplete = async (result: VerificationResult) => {
    setVerificationResult(result);
  };

  const handleVerificationError = (error: string) => {
    console.error('Verification error:', error);
    // You could show a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Passport Verification System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure passport verification using Self Protocol to verify age (18+) and unique identity.
            Your data remains private and secure.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Wallet Connection</h3>
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Connected:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Connect your wallet to store verification results on blockchain
                </p>
                <button
                  onClick={() => connect({ connector: injected() })}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <PassportVerification
            onVerificationComplete={handleVerificationComplete}
            onVerificationError={handleVerificationError}
          />

          {/* Verification Status */}
          {verificationResult && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Verification Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Verification:</span>
                  <span className={`font-semibold ${verificationResult.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {verificationResult.isVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Age Verification (18+):</span>
                  <span className={`font-semibold ${verificationResult.isOver18 ? 'text-green-600' : 'text-red-600'}`}>
                    {verificationResult.isOver18 ? '✓ Over 18' : '✗ Under 18'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unique Identity:</span>
                  <span className={`font-semibold ${verificationResult.hasUniqueIdentity ? 'text-green-600' : 'text-red-600'}`}>
                    {verificationResult.hasUniqueIdentity ? '✓ Unique' : '✗ Not Unique'}
                  </span>
                </div>
                {verificationResult.passportNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Passport Number:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {verificationResult.passportNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Web3Providers>
      <MainContent />
    </Web3Providers>
  );
}