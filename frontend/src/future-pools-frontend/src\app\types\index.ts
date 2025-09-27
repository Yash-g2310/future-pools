export interface User {
  id: string;
  address: string;
  ensName?: string;
  avatarUrl?: string;
}

export interface BorrowingDetails {
  loanId: string;
  amount: number;
  interestRate: number;
  duration: number;
  status: 'active' | 'completed' | 'defaulted';
}

export interface LendingDetails {
  lendingId: string;
  amount: number;
  interestRate: number;
  duration: number;
  status: 'active' | 'completed';
}

export interface StakingDetails {
  stakingId: string;
  amount: number;
  rewards: number;
  status: 'active' | 'completed';
}

export interface DashboardStatistics {
  totalStaked: number;
  totalLent: number;
  totalBorrowed: number;
  totalRewards: number;
}