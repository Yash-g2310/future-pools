'use client';

import { useState } from 'react';
import { useSelfVerification, VerificationResult } from '../hooks/useSelfVerification';
import { useVerificationContract } from '../hooks/useVerificationContract';
import { useAccount } from 'wagmi';

interface PassportVerificationProps {
  onVerificationComplete: (result: VerificationResult) => void;
  onVerificationError: (error: string) => void;
}

export default function PassportVerification({ 
  onVerificationComplete, 
  onVerificationError 
}: PassportVerificationProps) {
  const { address } = useAccount();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Self verification hooks
  const {
    verificationStep,
    isInitialized,
    isInitializing,
    startVerification,
    completeVerification,
    resetVerification,
    isStartingVerification,
    isCompletingVerification,
    startError,
    completeError,
  } = useSelfVerification();

  // Contract hooks
  const {
    storeVerification,
    isPending: isStoringOnChain,
    isConfirmed: isStoredOnChain,
    contractAddress,
    chainId,
  } = useVerificationContract();

  const handleStartVerification = async () => {
    try {
      await startVerification();
    } catch (error) {
      onVerificationError('Failed to start verification');
    }
  };

  const handleVerificationSuccess = async () => {
    try {
      // Simulate passport data for demo
      const demoPassportData = {
        passport_number: 'A1234567',
        date_of_birth: '1990-01-01',
        full_name: 'John Doe',
        nationality: 'US',
        passport_expiry_date: '2030-01-01',
      };

      // Use the mutation with proper callback
      completeVerification(demoPassportData, {
        onSuccess: (result) => {
          setVerificationResult(result);
          onVerificationComplete(result);

          // Store on blockchain if verification is successful
          if (result.isVerified && result.isOver18 && result.hasUniqueIdentity && address) {
            try {
              const passportHash = generatePassportHash(demoPassportData);
              storeVerification({
                isOver18: result.isOver18,
                hasUniqueIdentity: result.hasUniqueIdentity,
                passportHash,
              });
            } catch (error) {
              console.error('Failed to store verification on-chain:', error);
            }
          }
        },
        onError: (error) => {
          onVerificationError('Verification process failed. Please try again.');
        }
      });
    } catch (error) {
      onVerificationError('Verification process failed. Please try again.');
    }
  };

  const generatePassportHash = (passportData: any): string => {
    const dataString = JSON.stringify({
      passportNumber: passportData.passport_number,
      dateOfBirth: passportData.date_of_birth,
      fullName: passportData.full_name,
    });
    
    // Simple hash generation (in production, use proper hashing)
    return `0x${Buffer.from(dataString).toString('hex').slice(0, 64)}`;
  };

  const resetVerificationFlow = () => {
    resetVerification();
    setVerificationResult(null);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <h2 className="text-2xl font-bold text-gray-800">Initializing...</h2>
        <p className="text-gray-600 text-center">
          Setting up verification system...
        </p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600">Initialization Failed</h2>
        <p className="text-gray-600 text-center">
          Failed to initialize verification system. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (verificationStep === 'scanning') {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">Scan QR Code</h2>
        <p className="text-gray-600 text-center">
          Open the Self mobile app and scan this QR code to verify your passport
        </p>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-500 text-sm">QR Code Placeholder</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              In a real implementation, this would show a QR code generated by Self Protocol
            </p>
            <button
              onClick={handleVerificationSuccess}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simulate Verification
            </button>
          </div>
        </div>
        <button
          onClick={resetVerificationFlow}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (verificationStep === 'verifying') {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <h2 className="text-2xl font-bold text-gray-800">Verifying Passport</h2>
        <p className="text-gray-600 text-center">
          Please wait while we verify your passport and check your age...
        </p>
      </div>
    );
  }

  if (verificationStep === 'complete' && verificationResult) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-600">Verification Successful!</h2>
        <div className="space-y-2 text-center">
          <p className="text-gray-600">
            <span className="font-semibold">Age Verified:</span> {verificationResult.isOver18 ? 'Over 18 ✓' : 'Under 18 ✗'}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Identity Verified:</span> {verificationResult.hasUniqueIdentity ? 'Unique ✓' : 'Not unique ✗'}
          </p>
          {verificationResult.passportNumber && (
            <p className="text-gray-600">
              <span className="font-semibold">Passport:</span> {verificationResult.passportNumber}
            </p>
          )}
        </div>

        {/* Blockchain storage status */}
        {isStoringOnChain && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 text-sm">
                Storing verification result on blockchain...
              </span>
            </div>
          </div>
        )}

        {isStoredOnChain && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 text-sm">
                Verification result stored on blockchain ✓
              </span>
            </div>
          </div>
        )}

        <button
          onClick={resetVerificationFlow}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Verify Another Passport
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-lg shadow-lg">
    </div>
  );
}