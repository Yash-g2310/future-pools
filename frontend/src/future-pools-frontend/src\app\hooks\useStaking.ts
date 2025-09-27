import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fetchStakingData, stakeTokens, withdrawTokens } from '../lib/api';

export function useStaking() {
  const { address } = useAccount();
  const [stakingData, setStakingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStakingData = async () => {
      try {
        setLoading(true);
        const data = await fetchStakingData(address);
        setStakingData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      loadStakingData();
    }
  }, [address]);

  const stake = async (amount) => {
    try {
      setLoading(true);
      await stakeTokens(address, amount);
      // Optionally refresh staking data after staking
      const data = await fetchStakingData(address);
      setStakingData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount) => {
    try {
      setLoading(true);
      await withdrawTokens(address, amount);
      // Optionally refresh staking data after withdrawal
      const data = await fetchStakingData(address);
      setStakingData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stakingData,
    loading,
    error,
    stake,
    withdraw,
  };
}