import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import SelfQRcodeWrapper from './SelfQRcodeWrapper'; // Assuming this component handles the QR code scanning

interface QRVerificationPageProps {
  onVerificationComplete?: () => void;
  onBackToWallet?: () => void;
}

export default function QRVerificationPage({ 
  onVerificationComplete, 
  onBackToWallet 
}: QRVerificationPageProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      onBackToWallet?.();
    }
  }, [isConnected, onBackToWallet]);

  const handleVerificationSuccess = () => {
    // Redirect to the dashboard upon successful verification
    router.push('/dashboard');
    onVerificationComplete?.();
  };

  const handleVerificationError = () => {
    console.error('Verification failed');
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
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Scan QR Code for Verification</h2>
            <SelfQRcodeWrapper
              onSuccess={handleVerificationSuccess}
              onError={handleVerificationError}
            />
          </div>

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