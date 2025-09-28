'use client';

import DashboardLayout from '../components/DashboardLayout';
import StakingForm from './components/StakingForm';
import StakingPositions from './components/StakingPositions';

export default function StakingPage() {
  return (
    <DashboardLayout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-vt323">STAKING</h1>
          <p className="text-gray-400 max-w-3xl">
            Stake your PYUSD tokens to earn passive income and participate in the lending ecosystem.
            Your staked tokens will be used to back future agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Staking Form */}
          <div className="lg:col-span-1">
            <StakingForm />
          </div>

          {/* Right column - Positions */}
          <div className="lg:col-span-2">
            <StakingPositions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}