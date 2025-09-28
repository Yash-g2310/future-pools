'use client';

import React from 'react';

// Mock data for staking positions
const mockStakingPositions = [
  { id: 1, amount: 250, apy: '4.5%', startDate: '2023-07-15', duration: '30 days', status: 'Active' },
  { id: 2, amount: 150, apy: '3.8%', startDate: '2023-08-01', duration: '90 days', status: 'Active' },
  { id: 3, amount: 100, apy: '5.2%', startDate: '2023-06-10', duration: '180 days', status: 'Active' }
];

export default function StakingPositions() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white font-vt323">YOUR STAKING POSITIONS</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">APY</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">Duration</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockStakingPositions.map((position) => (
              <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  #{position.id}
                </th>
                <td className="px-6 py-4">
                  {position.amount} PYUSD
                </td>
                <td className="px-6 py-4 text-green-400">
                  {position.apy}
                </td>
                <td className="px-6 py-4">
                  {position.startDate}
                </td>
                <td className="px-6 py-4">
                  {position.duration}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {position.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-400">
                    Unstake
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {mockStakingPositions.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <p>You don't have any active staking positions.</p>
          <p className="mt-2">Start staking PYUSD to earn rewards!</p>
        </div>
      )}
    </div>
  );
}