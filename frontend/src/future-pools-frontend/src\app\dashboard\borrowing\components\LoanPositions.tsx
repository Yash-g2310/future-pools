import React from 'react';

const LoanPositions = () => {
  // Sample data for loan positions
  const loanPositions = [
    {
      id: 1,
      asset: 'ETH',
      amount: 2,
      interestRate: '5%',
      status: 'Active',
    },
    {
      id: 2,
      asset: 'DAI',
      amount: 1000,
      interestRate: '4%',
      status: 'Active',
    },
    {
      id: 3,
      asset: 'USDC',
      amount: 500,
      interestRate: '3.5%',
      status: 'Closed',
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Loan Positions</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Asset</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Interest Rate</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {loanPositions.map((position) => (
            <tr key={position.id}>
              <td className="py-2 px-4 border-b">{position.asset}</td>
              <td className="py-2 px-4 border-b">{position.amount}</td>
              <td className="py-2 px-4 border-b">{position.interestRate}</td>
              <td className="py-2 px-4 border-b">{position.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanPositions;