'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { countries, SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface QRVerificationPageProps {
  onVerificationComplete?: () => void;
  onVerificationError?: () => void;
  onBackToWallet?: () => void;
}

export default function QRVerificationPage({ 
  onVerificationComplete, 
  onBackToWallet,
  onVerificationError
}: QRVerificationPageProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const router = useRouter();
  const [, setUserVerified] = useLocalStorage('user_verified', null);

  // Initialize Self Protocol
  useEffect(() => {
    if (isConnected && address) {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Futures Pool',
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'human-blacklist-scope',
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || '0x3e2aa34c333474e3692abfb7a3f97a44173d0401',
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

  // Auto-redirect to dashboard on successful verification
  useEffect(() => {
    if (verificationStatus === 'success') {
      // Store verification status using safe localStorage hook
      setUserVerified('true');
      
      // Small delay to ensure localStorage is set before navigation
      const timer = setTimeout(() => {
        onVerificationComplete?.();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [verificationStatus, onVerificationComplete, setUserVerified]);

  const handleVerificationSuccess = () => {
    console.log('Verification successful!');
    setVerificationStatus('success');
  };

  const handleVerificationError = () => {
    console.error('Verification failed');
    setVerificationStatus('error');
    onVerificationError?.();
  };

  const handleDisconnect = () => {
    // Clear verification status using safe localStorage hook
    setUserVerified(null);
    // Disconnect wallet
    disconnect();
    // Return to wallet connect page
    onBackToWallet?.();
  };

  // Handle manual navigation to dashboard after verification
  const handleContinueToDashboard = () => {
    setUserVerified('true');
    onVerificationComplete?.();
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Uniform Grid background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Border lines */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
        
        <div className="relative flex flex-col items-center justify-center min-h-screen px-8">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full text-center hover:border-gray-500 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-vt323 tracking-wide">WALLET NOT CONNECTED</h2>
            <p className="text-gray-300 mb-6 font-inter">Please connect your wallet first to proceed with verification.</p>
            <button
              onClick={onBackToWallet}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white py-3 px-6 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
            >
              Back to Wallet Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Uniform Grid background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Border lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white opacity-10"></div>
      
      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-6 bg-black border-b border-gray-800">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">V</span>
          </div>
          <h1 className="ml-4 text-2xl font-bold tracking-wide text-white">
            <span className="text-cyan-400">PASSPORT</span> VERIFICATION
          </h1>
        </div>

        {/* Right side - Wallet info */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg flex items-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
            <span className="text-sm font-mono text-gray-300">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="bg-transparent border border-gray-600 hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-300"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-2xl w-full hover:border-gray-500 transition-colors duration-200">
          
          {/* QR Code Section */}
          <div className="text-center">
            {verificationStatus === 'success' ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-green-900/50 border border-green-500/50 text-green-400 p-6 rounded-lg flex items-center">
                  <span className="text-3xl mr-3">✓</span>
                  <div>
                    <h3 className="text-xl font-bold font-vt323 tracking-wide">VERIFICATION SUCCESSFUL</h3>
                    <p className="text-green-300 font-inter">Your passport has been verified</p>
                  </div>
                </div>
                <button
                  onClick={handleContinueToDashboard}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white py-3 px-8 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  Continue to Dashboard
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-white mb-6 font-vt323 tracking-wide">SCAN QR CODE FOR VERIFICATION</h2>
                
                {!selfApp ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
                    <p className="text-gray-300 font-inter">Initializing verification system...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg inline-block">
                      <SelfQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={handleVerificationSuccess}
                        onError={handleVerificationError}
                      />
                    </div>
                    <p className="text-gray-300 font-inter max-w-md mx-auto">
                      Use your mobile device to scan this QR code for passport verification
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {verificationStatus !== 'success' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={onBackToWallet}
                className="bg-gray-800 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white py-3 px-6 rounded-lg font-semibold uppercase tracking-wide transition-all duration-300"
              >
                Back to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}