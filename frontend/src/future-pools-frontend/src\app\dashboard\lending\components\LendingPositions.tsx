import React from 'react';

const LendingPositions = () => {
  // Sample data for lending positions
  const lendingPositions = [
    {
      id: 1,
      asset: 'DAI',
      amount: 1000,
      interestRate: '5%',
      duration: '30 days',
    },
    {
      id: 2,
      asset: 'USDC',
      amount: 500,
      interestRate: '4.5%',
      duration: '60 days',
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Lending Positions</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Asset</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Interest Rate</th>
            <th className="py-2 px-4 border-b">Duration</th>
          </tr>
        </thead>
        <tbody>
          {lendingPositions.map((position) => (
            <tr key={position.id}>
              <td className="py-2 px-4 border-b">{position.asset}</td>
              <td className="py-2 px-4 border-b">{position.amount}</td>
              <td className="py-2 px-4 border-b">{position.interestRate}</td>
              <td className="py-2 px-4 border-b">{position.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LendingPositions;