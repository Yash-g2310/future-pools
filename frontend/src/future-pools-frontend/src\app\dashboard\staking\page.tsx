import React from 'react';
import StakingForm from './components/StakingForm';
import StakingPositions from './components/StakingPositions';
import StakingRewards from './components/StakingRewards';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardLayout from '../components/DashboardLayout';

const StakingPage = () => {
  return (
    <DashboardLayout>
      <DashboardHeader title="Staking" />
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 p-4">
          <StakingForm />
          <StakingPositions />
          <StakingRewards />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StakingPage;