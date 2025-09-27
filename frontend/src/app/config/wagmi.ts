import { createConfig, http } from '@wagmi/core';
import { mainnet, sepolia, localhost } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http('https://sepolia.example.com'),
    [mainnet.id]: http('https://mainnet.example.com'),
  },
});

// Contract addresses for different chains
export const CONTRACT_ADDRESSES = {
  [mainnet.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_MAINNET || '',
  [sepolia.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_SEPOLIA || '',
  [localhost.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_LOCAL || '',
} as const;

// Contract ABI for verification storage
export const VERIFICATION_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "bool", "name": "isOver18", "type": "bool" },
      { "internalType": "bool", "name": "hasUniqueIdentity", "type": "bool" },
      { "internalType": "string", "name": "passportHash", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "storeVerification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getVerification",
    "outputs": [
      { "internalType": "bool", "name": "isOver18", "type": "bool" },
      { "internalType": "bool", "name": "hasUniqueIdentity", "type": "bool" },
      { "internalType": "string", "name": "passportHash", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "isVerified",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "isOver18", "type": "bool" },
      { "indexed": false, "internalType": "bool", "name": "hasUniqueIdentity", "type": "bool" },
      { "indexed": false, "internalType": "string", "name": "passportHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VerificationStored",
    "type": "event"
  }
] as const;
