import { useState, useEffect } from 'react';
import { fetchBorrowingData, createBorrowRequest } from '../lib/api';

export function useBorrowing() {
  const [borrowingData, setBorrowingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBorrowingData = async () => {
      try {
        const data = await fetchBorrowingData();
        setBorrowingData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadBorrowingData();
  }, []);

  const borrow = async (amount, duration) => {
    try {
      const response = await createBorrowRequest(amount, duration);
      return response;
    } catch (err) {
      setError(err);
    }
  };

  return {
    borrowingData,
    loading,
    error,
    borrow,
  };
}