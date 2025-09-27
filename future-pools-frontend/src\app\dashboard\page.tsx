import React from 'react';
import DashboardHeader from './components/DashboardHeader';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardLayout from './components/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold">Staking</h2>
              <p>Manage your staking positions and rewards.</p>
              <a href="/dashboard/staking" className="text-blue-500">Go to Staking</a>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold">Lending</h2>
              <p>View and manage your lending positions.</p>
              <a href="/dashboard/lending" className="text-blue-500">Go to Lending</a>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold">Borrowing</h2>
              <p>Check your borrowing history and current loans.</p>
              <a href="/dashboard/borrowing" className="text-blue-500">Go to Borrowing</a>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}