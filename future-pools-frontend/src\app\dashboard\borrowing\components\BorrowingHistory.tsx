import React from 'react';

const BorrowingHistory = () => {
  // Sample data for borrowing history
  const borrowingData = [
    {
      id: 1,
      amount: '100 DAI',
      interestRate: '5%',
      date: '2023-01-15',
      status: 'Active',
    },
    {
      id: 2,
      amount: '50 DAI',
      interestRate: '4%',
      date: '2023-02-20',
      status: 'Paid',
    },
    {
      id: 3,
      amount: '200 DAI',
      interestRate: '6%',
      date: '2023-03-10',
      status: 'Active',
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Borrowing History</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Interest Rate</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {borrowingData.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.id}</td>
              <td className="py-2 px-4 border-b">{item.amount}</td>
              <td className="py-2 px-4 border-b">{item.interestRate}</td>
              <td className="py-2 px-4 border-b">{item.date}</td>
              <td className="py-2 px-4 border-b">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowingHistory;