# FuturePool – Trustless Lending, Backed by Identity

**Tagline:** "FuturePool – a Trustless Lending and Staking platform, Backed by Identity."

## Overview

FuturePool is a decentralized lending protocol that blends DeFi flexibility with real-world accountability. Lenders create escrow-backed contracts by defining token amounts and settlement timelines, while borrowers participate by contributing collateral and partial upfront payments in PYUSD. All escrows are denominated in PYUSD, with prices secured through Pyth oracle feeds. Identity verification via SELF ensures only verified users can borrow, addressing fraud and multi-account risks without compromising decentralization. By anchoring settlements in stable collateral, FuturePool creates a trust-minimized way for lenders to protect their principal while giving borrowers transparent terms and fair repayment structures.

## 🏗️ Architecture

### Smart Contracts (`/contracts`)

#### Core Contracts
- **`FutureEscrow.sol`** - Individual escrow contracts handling lending agreements
- **`FutureEscrowFactory.sol`** - Factory for creating and managing escrow contracts
- **`StakingPool.sol`** - PYUSD staking pool that backs lending operations
- **`PassportVerifier.sol`** - Identity verification contract using SELF protocol
- **`ProofOfHumanWithBlacklist.sol`** - Enhanced identity verification with blacklist functionality

#### Key Features
- **PYUSD-denominated escrows** with Pyth oracle price feeds
- **50% collateral requirement** for borrowers
- **Identity verification** through SELF protocol integration
- **Automated settlement** based on token price movements
- **Default handling** with blacklist enforcement
- **Cross-chain bridge support** for verification

### Frontend (`/frontend`)

#### Technology Stack
- **Next.js 14** with TypeScript
- **wagmi** for Web3 wallet integration
- **SELF Protocol** for passport verification
- **Tailwind CSS** with custom animations
- **VT323 font** for retro-futuristic styling

#### Key Components
- **Wallet Connection** with Web3 wallet support
- **QR-based Identity Verification** using SELF protocol
- **Dashboard** with staking, lending, and borrowing interfaces
- **Real-time Portfolio Management**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Foundry for smart contract development
- Web3 wallet (MetaMask recommended)

### Smart Contract Setup

```bash
cd contracts

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Deploy contracts (configure .env first)
forge script script/DeployProofOfHumanWithBlacklist.s.sol --broadcast
```

#### Environment Variables (`contracts/.env`)
```bash
PRIVATE_KEY=your_private_key
RPC_URL=https://your-rpc-endpoint
IDENTITY_VERIFICATION_HUB_ADDRESS=0x...
PYUSD_ADDRESS=0x...
PYTH_ORACLE_ADDRESS=0x...
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

#### Frontend Environment Variables (`.env.local`)
```bash
NEXT_PUBLIC_SELF_APP_NAME="FuturePool"
NEXT_PUBLIC_SELF_SCOPE="human-blacklist-scope"
NEXT_PUBLIC_SELF_ENDPOINT="0x..."
WEB3_PROJECT_ID=your_walletconnect_project_id
```

## 💡 How It Works

### For Lenders

1. **Stake PYUSD** in the staking pool
2. **Create Escrow** by specifying:
   - Token type and amount to lend
   - Expiration time for borrower acceptance
   - Settlement duration
3. **Automatic Settlement** based on token price at maturity
4. **Profit/Loss Distribution** handled by smart contracts

### For Borrowers

1. **Complete Identity Verification** via SELF protocol
2. **Find Available Escrows** on the platform
3. **Post 50% Collateral** in PYUSD
4. **Receive Loan** immediately upon acceptance
5. **Settlement** occurs automatically at contract maturity

### Settlement Mechanics

- **Current Token Value ≤ Collateral**: Borrower receives refund, lender gets current value
- **Current Token Value > Collateral**: Additional amount sourced from lender's stake
- **Default Handling**: 7-day grace period, then collateral transferred to lender

## 🔐 Security Features

### Identity Verification
- **SELF Protocol Integration** for passport verification
- **Blacklist Management** to prevent fraudulent users
- **Cross-chain Verification** with bridge operator support

### Financial Security
- **Pyth Oracle Integration** for reliable price feeds
- **Automated Settlement** eliminates manual intervention
- **Collateral Requirements** protect lender interests
- **Default Reporting** maintains system integrity

### Smart Contract Security
- **OpenZeppelin Libraries** for battle-tested implementations
- **ReentrancyGuard** protection on all external calls
- **Access Control** for administrative functions
- **Emergency Functions** for handling edge cases

## 🎯 Use Cases

### Futures Trading
- Lenders can profit from token price appreciation
- Borrowers can hedge against price volatility
- Automated settlement ensures fair execution

### Yield Generation
- Stake PYUSD to earn from lending activities
- Participate in escrow creation for higher yields
- Diversified risk across multiple borrowers

### Identity-Gated Lending
- KYC/AML compliance through SELF verification
- Reduced fraud risk with passport verification
- Blacklist enforcement for repeat offenders

## 📊 Contract Addresses

### Testnet Deployments
```
FutureEscrowFactory: 0x... (deployed)
StakingPool: 0x... (deployed)
PassportVerifier: 0x... (deployed)
```

## 🔧 Development

### Smart Contract Development

```bash
# Run local blockchain
anvil

# Deploy to local network
forge script script/DeployProofOfHumanWithBlacklist.s.sol --rpc-url http://localhost:8545 --broadcast

# Run specific tests
forge test --match-contract FutureEscrowTest

# Generate gas report
forge test --gas-report
```

### Frontend Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow Solidity style guide for smart contracts
- Use TypeScript for all frontend code
- Maintain test coverage above 80%
- Document all public functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.futurepool.xyz](https://docs.futurepool.xyz)
- **Discord**: [discord.gg/futurepool](https://discord.gg/futurepool)
- **Twitter**: [@FuturePoolDeFi](https://twitter.com/FuturePoolDeFi)
- **Email**: support@futurepool.xyz

## ⚠️ Disclaimer

FuturePool is experimental DeFi software. Users should understand the risks involved in:
- Smart contract vulnerabilities
- Oracle price manipulation
- Identity verification dependencies
- Regulatory compliance requirements

Always conduct your own research and never invest more than you can afford to lose.

---

**Built with ❤️ by the FuturePool Team**