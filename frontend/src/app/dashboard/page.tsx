'use client';

import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import StatisticsCard from './components/StatisticsCard';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatisticsCard 
          title="Total Value Locked" 
          value="$1,245,300" 
          description="Across all pools"
        />
        <StatisticsCard 
          title="Your Portfolio Value" 
          value="$12,450" 
          description="+3.2% from last week"
        />
        <StatisticsCard 
          title="Available Liquidity" 
          value="$450,000" 
          description="Ready for borrowing"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Staking</h2>
          <p className="text-gray-600 mb-4">Stake your assets to earn rewards and participate in governance.</p>
          <a href="/dashboard/staking" className="text-blue-600 hover:underline">Manage staking positions →</a>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Lending</h2>
          <p className="text-gray-600 mb-4">Supply assets to earn interest and provide liquidity to the protocol.</p>
          <a href="/dashboard/lending" className="text-blue-600 hover:underline">View lending options →</a>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Borrowing</h2>
          <p className="text-gray-600 mb-4">Borrow assets against your collateral at competitive rates.</p>
          <a href="/dashboard/borrowing" className="text-blue-600 hover:underline">Check borrowing options →</a>
        </div>
      </div>
    </DashboardLayout>
  );
}