import React from 'react';
import LendingForm from './components/LendingForm';
import LendingPositions from './components/LendingPositions';
import MarketOverview from './components/MarketOverview';
import DashboardHeader from '../components/DashboardHeader';
import DashboardLayout from '../components/DashboardLayout';

const LendingPage = () => {
  return (
    <DashboardLayout>
      <DashboardHeader title="Lending" />
      <MarketOverview />
      <LendingForm />
      <LendingPositions />
    </DashboardLayout>
  );
};

export default LendingPage;