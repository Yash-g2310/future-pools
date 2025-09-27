import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchLendingData, createLendingPosition } from '../lib/api';

export function useLending() {
  const { address } = useAccount();
  const [lendingPositions, setLendingPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLendingData = async () => {
      try {
        setLoading(true);
        const data = await fetchLendingData(address);
        setLendingPositions(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      loadLendingData();
    }
  }, [address]);

  const addLendingPosition = async (amount, interestRate) => {
    try {
      const newPosition = await createLendingPosition(address, amount, interestRate);
      setLendingPositions((prev) => [...prev, newPosition]);
    } catch (err) {
      setError(err);
    }
  };

  return {
    lendingPositions,
    loading,
    error,
    addLendingPosition,
  };
}