'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

export interface VerificationResult {
  isVerified: boolean;
  isOver18: boolean;
  hasUniqueIdentity: boolean;
  passportNumber?: string;
  error?: string;
}

export interface SelfVerificationData {
  passport_number: string;
  date_of_birth: string;
  full_name: string;
  nationality: string;
  passport_expiry_date: string;
}

export function useSelfVerification() {
  const [selfApp, setSelfApp] = useState<any>(null);
  const { address, isConnected } = useAccount();
  const [verificationStep, setVerificationStep] = useState<'idle' | 'scanning' | 'verifying' | 'complete'>('idle');

  // Initialize Self SDK
  const { data: isInitialized, isLoading: isInitializing } = useQuery({
    queryKey: ['self-sdk-init'],
    queryFn: async () => {
      try {
        // Initialize Self App Builder with proper configuration
        const app = new SelfAppBuilder({
          userId: address,
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
          endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
          endpointType: "staging_https",
          userIdType: "hex",
          userDefinedData: "Hello World",
          disclosures: {
            //check the API reference for more disclose attributes!
            minimumAge: 18,
            nationality: true,
            gender: true,
          }
        }).build();

        setSelfApp(app);
        return true;
      } catch (error) {
        console.error('Failed to initialize Self SDK:', error);
        throw new Error('Failed to initialize verification system');
      }
    },
    staleTime: Infinity, // SDK initialization doesn't change
  });

  // Start verification mutation
  const startVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!selfApp) {
        throw new Error('Verification system not ready');
      }
      setVerificationStep('scanning');
      return true;
    },
  });

  // Complete verification mutation
  const completeVerificationMutation = useMutation({
    mutationFn: async (verificationData: SelfVerificationData): Promise<VerificationResult> => {
      setVerificationStep('verifying');
      
      try {
        // Get verification data from Self App
        const verificationResult = await selfApp.getVerificationData();
        
        // Check age verification
        const isOver18 = await selfApp.verifyAge(verificationData.date_of_birth, 18);
        
        // Check unique identity
        const hasUniqueIdentity = await selfApp.verifyUniqueIdentity({
          passportNumber: verificationData.passport_number,
          dateOfBirth: verificationData.date_of_birth,
          fullName: verificationData.full_name
        });

        const result: VerificationResult = {
          isVerified: true,
          isOver18,
          hasUniqueIdentity,
          passportNumber: verificationData.passport_number
        };

        setVerificationStep('complete');
        return result;
      } catch (error) {
        console.error('Verification failed:', error);
        throw new Error('Verification process failed. Please try again.');
      }
    },
  });

  // Reset verification
  const resetVerification = () => {
    setVerificationStep('idle');
  };

  return {
    // State
    selfApp,
    verificationStep,
    isInitialized,
    isInitializing,
    
    // Mutations
    startVerification: startVerificationMutation.mutate,
    startVerificationAsync: startVerificationMutation.mutateAsync,
    completeVerification: completeVerificationMutation.mutate,
    completeVerificationAsync: completeVerificationMutation.mutateAsync,
    resetVerification,
    
    // Loading states
    isStartingVerification: startVerificationMutation.isPending,
    isCompletingVerification: completeVerificationMutation.isPending,
    
    // Error states
    startError: startVerificationMutation.error,
    completeError: completeVerificationMutation.error,
  };
}
