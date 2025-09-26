import { ethers } from 'ethers';

// Contract ABI for verification storage
const VERIFICATION_CONTRACT_ABI = [
  "function storeVerification(address user, bool isOver18, bool hasUniqueIdentity, string memory passportHash, uint256 timestamp) external",
  "function getVerification(address user) external view returns (bool isOver18, bool hasUniqueIdentity, string memory passportHash, uint256 timestamp)",
  "function isVerified(address user) external view returns (bool)",
  "event VerificationStored(address indexed user, bool isOver18, bool hasUniqueIdentity, string passportHash, uint256 timestamp)"
];

export class ContractIntegration {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com'
    );
    
    // Initialize contract
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT || '0x0000000000000000000000000000000000000000',
      VERIFICATION_CONTRACT_ABI,
      this.provider
    );
  }

  // Connect wallet and get signer
  async connectWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await provider.getSigner();
        console.log('Wallet connected successfully');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw new Error('Failed to connect wallet');
      }
    } else {
      throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
    }
  }

  // Store verification result on-chain
  async storeVerification(
    userAddress: string,
    isOver18: boolean,
    hasUniqueIdentity: boolean,
    passportHash: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create contract instance with signer
      const contractWithSigner = this.contract.connect(this.signer);
      
      // Get current timestamp
      const timestamp = Math.floor(Date.now() / 1000);
      
      // For now, simulate the transaction since the contract doesn't exist yet
      console.log('Simulating contract transaction:', {
        userAddress,
        isOver18,
        hasUniqueIdentity,
        passportHash,
        timestamp
      });
      
      // In a real implementation, you would call:
      // const tx = await contractWithSigner.storeVerification(
      //   userAddress,
      //   isOver18,
      //   hasUniqueIdentity,
      //   passportHash,
      //   timestamp
      // );
      
      // Simulate transaction hash
      const simulatedTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      console.log('Simulated transaction hash:', simulatedTxHash);
      
      return simulatedTxHash;
    } catch (error) {
      console.error('Failed to store verification on-chain:', error);
      throw new Error('Failed to store verification result');
    }
  }

  // Get verification result from contract
  async getVerification(userAddress: string): Promise<{
    isOver18: boolean;
    hasUniqueIdentity: boolean;
    passportHash: string;
    timestamp: number;
  } | null> {
    try {
      // For now, return null since the contract doesn't exist yet
      // In a real implementation, you would call:
      // const result = await this.contract.getVerification(userAddress);
      return null;
    } catch (error) {
      console.error('Failed to get verification from contract:', error);
      return null;
    }
  }

  // Check if user is verified
  async isUserVerified(userAddress: string): Promise<boolean> {
    try {
      // For now, return false since the contract doesn't exist yet
      // In a real implementation, you would call:
      // return await this.contract.isVerified(userAddress);
      return false;
    } catch (error) {
      console.error('Failed to check verification status:', error);
      return false;
    }
  }

  // Generate passport hash for privacy
  generatePassportHash(passportData: any): string {
    const dataString = JSON.stringify({
      passportNumber: passportData.passport_number,
      dateOfBirth: passportData.date_of_birth,
      fullName: passportData.full_name
    });
    
    // Generate hash for privacy
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  // Verify passport hash matches stored data
  verifyPassportHash(passportData: any, storedHash: string): boolean {
    const generatedHash = this.generatePassportHash(passportData);
    return generatedHash === storedHash;
  }
}

// Utility function to get user's wallet address
export const getUserAddress = async (): Promise<string> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts[0];
    } catch (error) {
      console.error('Failed to get user address:', error);
      throw new Error('Failed to get wallet address');
    }
  } else {
    throw new Error('No wallet found');
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}