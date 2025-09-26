'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, VERIFICATION_CONTRACT_ABI } from '../config/wagmi';

export interface VerificationData {
  isOver18: boolean;
  hasUniqueIdentity: boolean;
  passportHash: string;
  timestamp: bigint;
}

export function useVerificationContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  // Read verification data
  const {
    data: verificationData,
    isLoading: isLoadingVerification,
    error: verificationError,
    refetch: refetchVerification,
  } = useReadContract({
    // address: contractAddress,
    abi: VERIFICATION_CONTRACT_ABI,
    functionName: 'getVerification',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Check if user is verified
  const {
    data: isVerified,
    isLoading: isLoadingVerified,
    error: verifiedError,
  } = useReadContract({
    // address: contractAddress,
    abi: VERIFICATION_CONTRACT_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Write contract for storing verification
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Store verification mutation
  const storeVerificationMutation = useMutation({
    mutationFn: async ({
      isOver18,
      hasUniqueIdentity,
      passportHash,
    }: {
      isOver18: boolean;
      hasUniqueIdentity: boolean;
      passportHash: string;
    }) => {
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network');
      }

      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      return writeContract({
        address: contractAddress as `0x${string}`,
        abi: VERIFICATION_CONTRACT_ABI,
        functionName: 'storeVerification',
        args: [address!, isOver18, hasUniqueIdentity, passportHash, timestamp],
      });
    },
    onSuccess: () => {
      // Invalidate and refetch verification data
      queryClient.invalidateQueries({
        queryKey: ['verification', address],
      });
    },
  });

  // Generate passport hash
  const generatePassportHash = (passportData: any): string => {
    const dataString = JSON.stringify({
      passportNumber: passportData.passport_number,
      dateOfBirth: passportData.date_of_birth,
      fullName: passportData.full_name,
    });
    
    // Simple hash generation (in production, use proper hashing)
    return `0x${Buffer.from(dataString).toString('hex').slice(0, 64)}`;
  };

  // Verify passport hash
  const verifyPassportHash = (passportData: any, storedHash: string): boolean => {
    const generatedHash = generatePassportHash(passportData);
    return generatedHash === storedHash;
  };

  return {
    // Contract data
    verificationData: verificationData as VerificationData | undefined,
    isVerified: isVerified as boolean | undefined,
    
    // Loading states
    isLoadingVerification,
    isLoadingVerified,
    isPending,
    isConfirming,
    isConfirmed,
    
    // Error states
    verificationError,
    verifiedError,
    writeError,
    
    // Actions
    storeVerification: storeVerificationMutation.mutate,
    storeVerificationAsync: storeVerificationMutation.mutateAsync,
    refetchVerification,
    
    // Utilities
    generatePassportHash,
    verifyPassportHash,
    
    // Contract info
    contractAddress,
    chainId,
    address,
  };
}
