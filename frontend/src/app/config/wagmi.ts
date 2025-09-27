import { createConfig, http } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import { metaMask, injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, base, sepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
})

export const CONTRACT_ADDRESSES = {
  [mainnet.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_MAINNET || '',
  [base.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_SEPOLIA || '',
  [sepolia.id]: process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_SEPOLIA || '',
} as const;

// Contract ABI for verification storage
export const VERIFICATION_CONTRACT_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "identityVerificationHubV2Address",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "scopeSeed",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_verificationConfig",
        "type": "tuple",
        "internalType": "struct SelfUtils.UnformattedVerificationConfigV2",
        "components": [
          {
            "name": "olderThan",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "forbiddenCountries",
            "type": "string[]",
            "internalType": "string[]"
          },
          {
            "name": "ofacEnabled",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addBlacklistedPassport",
    "inputs": [
      {
        "name": "hashedPassport",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "blacklistedPassports",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getConfigId",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "onVerificationSuccess",
    "inputs": [
      {
        "name": "output",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "userData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeBlacklistedPassport",
    "inputs": [
      {
        "name": "hashedPassport",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "scope",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verificationConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "olderThanEnabled",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "olderThan",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "forbiddenCountriesEnabled",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verificationConfigId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifySelfProof",
    "inputs": [
      {
        "name": "proofPayload",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "userContextData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "BlacklistedPassportBlocked",
    "inputs": [
      {
        "name": "hashedPassportNumber",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "userIdentifier",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "nullifier",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VerificationSucceeded",
    "inputs": [
      {
        "name": "userIdentifier",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "nullifier",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "InvalidDataFormat",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedCaller",
    "inputs": []
  }
] as const;
