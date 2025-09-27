import React from 'react';
import BorrowForm from './components/BorrowForm';
import BorrowingHistory from './components/BorrowingHistory';
import LoanPositions from './components/LoanPositions';
import DashboardHeader from '../components/DashboardHeader';
import DashboardLayout from '../components/DashboardLayout';

const BorrowingPage = () => {
  return (
    <DashboardLayout>
      <DashboardHeader title="Borrowing" />
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Borrow Funds</h2>
        <BorrowForm />
        <h2 className="text-2xl font-bold mt-8 mb-4">Your Loan Positions</h2>
        <LoanPositions />
        <h2 className="text-2xl font-bold mt-8 mb-4">Borrowing History</h2>
        <BorrowingHistory />
      </div>
    </DashboardLayout>
  );
};

export default BorrowingPage;