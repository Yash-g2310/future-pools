# Future Pools Frontend

## Overview
The Future Pools Frontend is a decentralized finance (DeFi) application that allows users to connect their wallets and perform various financial activities such as staking, lending, and borrowing. The application utilizes QR code verification for user authentication and provides a user-friendly dashboard for managing financial activities.

## Features
- **Wallet Connection**: Users can connect their wallets using various supported connectors.
- **QR Code Verification**: Users can verify their identity through a QR code scanning process.
- **Dashboard**: A comprehensive dashboard that includes:
  - **Staking**: Users can stake their assets and view their staking positions and rewards.
  - **Lending**: Users can lend their assets, view lending positions, and get an overview of the lending market.
  - **Borrowing**: Users can borrow assets, view their borrowing history, and manage loan positions.

## Project Structure
```
future-pools-frontend
├── public
│   └── assets
│       └── images
│           └── logo.svg
├── src
│   ├── app
│   │   ├── auth
│   │   │   ├── components
│   │   │   │   ├── QRVerificationPage.tsx
│   │   │   │   └── WalletConnectPage.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── borrowing
│   │   │   │   ├── components
│   │   │   │   │   ├── BorrowForm.tsx
│   │   │   │   │   ├── BorrowingHistory.tsx
│   │   │   │   │   └── LoanPositions.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── lending
│   │   │   │   ├── components
│   │   │   │   │   ├── LendingForm.tsx
│   │   │   │   │   ├── LendingPositions.tsx
│   │   │   │   │   └── MarketOverview.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── staking
│   │   │   │   ├── components
│   │   │   │   │   ├── StakingForm.tsx
│   │   │   │   │   ├── StakingPositions.tsx
│   │   │   │   │   └── StakingRewards.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── DashboardSidebar.tsx
│   │   │   │   └── StatisticsCard.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── account.tsx
│   │   │   ├── wallet-options.tsx
│   │   │   └── WagmiProvider.tsx
│   │   ├── config
│   │   │   └── wagmi.ts
│   │   ├── hooks
│   │   │   ├── useAuthentication.ts
│   │   │   ├── useBorrowing.ts
│   │   │   ├── useLending.ts
│   │   │   └── useStaking.ts
│   │   ├── lib
│   │   │   ├── api.ts
│   │   │   ├── contracts.ts
│   │   │   └── utils.ts
│   │   ├── providers
│   │   │   └── AuthProvider.tsx
│   │   ├── types
│   │   │   └── index.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── styles
│       └── globals.css
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd future-pools-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Technologies Used
- **Next.js**: A React framework for building server-side rendered applications.
- **Wagmi**: A React Hooks library for Ethereum that simplifies the process of connecting to wallets and managing state.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **TypeScript**: A superset of JavaScript that adds static types, enhancing code quality and maintainability.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.