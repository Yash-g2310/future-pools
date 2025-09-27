'use client';

import DashboardLayout from './components/DashboardLayout';
import StatisticsSection from './components/StatisticsSection';
import SectionHeader from './components/SectionHeader';
import FeatureGrid from './components/FeatureGrid';

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* DeFi Features Section */}
      <SectionHeader 
        title="EXPLORE DEFI"
        description="Access a comprehensive suite of DeFi tools designed to maximize your crypto potential. From staking and lending to governance and analytics, everything you need is at your fingertips."
      />

      {/* Features Grid - Dark theme with gaps */}
      <FeatureGrid />

      {/* Statistics Section - Dark theme matching SectionHeader and FeatureGrid */}
      <StatisticsSection />
    </DashboardLayout>
  );
}