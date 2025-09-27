import React from 'react';

const StakingPositions = () => {
  // Sample data for staking positions
  const stakingData = [
    {
      id: 1,
      token: 'ETH',
      amount: 2.5,
      rewards: 0.1,
    },
    {
      id: 2,
      token: 'DAI',
      amount: 1000,
      rewards: 5,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Staking Positions</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Token</th>
            <th className="py-2 px-4 border-b">Amount Staked</th>
            <th className="py-2 px-4 border-b">Rewards Earned</th>
          </tr>
        </thead>
        <tbody>
          {stakingData.map((position) => (
            <tr key={position.id}>
              <td className="py-2 px-4 border-b">{position.token}</td>
              <td className="py-2 px-4 border-b">{position.amount}</td>
              <td className="py-2 px-4 border-b">{position.rewards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StakingPositions;