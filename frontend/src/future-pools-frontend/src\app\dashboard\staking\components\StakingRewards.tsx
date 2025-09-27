import React from 'react';

const StakingRewards = () => {
  // Sample rewards data
  const rewards = [
    { id: 1, amount: 100, date: '2023-10-01' },
    { id: 2, amount: 150, date: '2023-10-15' },
    { id: 3, amount: 200, date: '2023-10-30' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Staking Rewards</h2>
      <table className="min-w-full bg-gray-100">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Reward ID</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map((reward) => (
            <tr key={reward.id}>
              <td className="py-2 px-4 border-b">{reward.id}</td>
              <td className="py-2 px-4 border-b">{reward.amount}</td>
              <td className="py-2 px-4 border-b">{reward.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StakingRewards;