// Self Protocol Configuration
export const SELF_CONFIG = {
  // App ID from Self Protocol dashboard
  appId: process.env.NEXT_PUBLIC_SELF_APP_ID || 'your-self-app-id',
  
  // Environment: 'production' or 'staging'
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
  
  // Verification requirements for passport verification
  passportVerification: {
    // Required fields from passport
    requiredFields: [
      'passport_number',
      'date_of_birth', 
      'full_name',
      'nationality',
      'passport_expiry_date',
      'passport_issue_date'
    ],
    
    // Age verification settings
    ageVerification: {
      minimumAge: 18,
      required: true,
      strictVerification: true, // Use strict age verification
      allowMarginOfError: false // Don't allow any margin for age verification
    },
    
    // Identity verification settings
    identityVerification: {
      uniqueIdentity: true, // Ensure user has unique identity
      preventDuplicates: true, // Prevent multiple accounts with same identity
      crossPlatformCheck: true // Check across different platforms
    },
    
    // Security settings
    security: {
      encryptionLevel: 'high', // High level encryption for sensitive data
      dataRetention: 'minimal', // Minimal data retention policy
      auditLogging: true // Enable audit logging
    }
  },
  
  // Contract configuration for on-chain verification
  contract: {
    // Contract address for verification results
    verificationContract: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT || '',
    
    // Network configuration
    network: {
      chainId: 1, // Ethereum mainnet
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com',
    },
    
    // Gas settings
    gasSettings: {
      gasLimit: 500000,
      maxFeePerGas: '20000000000', // 20 gwei
      maxPriorityFeePerGas: '2000000000' // 2 gwei
    }
  },
  
  // UI/UX settings
  ui: {
    theme: 'light', // 'light' or 'dark'
    showProgress: true,
    enableRetry: true,
    maxRetries: 3
  }
};

// Verification result types
export interface VerificationResult {
  isVerified: boolean;
  isOver18: boolean;
  hasUniqueIdentity: boolean;
  passportNumber?: string;
  verificationId?: string;
  timestamp?: number;
  error?: string;
}

// Age verification helper
export const verifyAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

// Identity uniqueness checker
export const checkIdentityUniqueness = async (
  passportData: any,
  sdk: any
): Promise<boolean> => {
  try {
    // This would integrate with Self's identity verification system
    // to check if the identity is unique across their network
    const uniquenessCheck = await sdk.checkIdentityUniqueness({
      passportNumber: passportData.passport_number,
      dateOfBirth: passportData.date_of_birth,
      fullName: passportData.full_name
    });
    
    return uniquenessCheck.isUnique;
  } catch (error) {
    console.error('Identity uniqueness check failed:', error);
    return false;
  }
};
