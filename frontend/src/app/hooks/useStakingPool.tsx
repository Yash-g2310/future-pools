'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useBalance
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'react-hot-toast';

const STAKING_POOL_ADDRESS = '0x63760d2df8f0fa8952f7a93ec951fb6d77b6ac69';
const PYUSD_ADDRESS = '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21';

// ABI for StakingPool contract (include only the functions we need)
const STAKING_POOL_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBalance",
    "outputs": [
      {"internalType": "uint256", "name": "staked", "type": "uint256"},
      {"internalType": "uint256", "name": "locked", "type": "uint256"},
      {"internalType": "uint256", "name": "available", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ABI for PYUSD (ERC20) contract
const PYUSD_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export function useStakingPool() {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [balances, setBalances] = useState({
    stakedBalance: 0,
    lockedBalance: 0,
    availableBalance: 0,
    pyusdBalance: 0,
  });
  
  const isMounted = useRef(true);

  // Get PYUSD balance
  const { data: pyusdBalance, refetch: refetchPyusd } = useBalance({
    address,
    token: PYUSD_ADDRESS as `0x${string}`,
    query: { enabled: !!address }
  });

  // Get staking balances
  const { data: userBalances, refetch: refetchBalances } = useReadContract({
    address: STAKING_POOL_ADDRESS as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Write contract hooks
  const { writeContract: writeApprove, isPending: isApproveLoading, data: approveHash } = useWriteContract();
  const { writeContract: writeStake, isPending: isStakeLoading, data: stakeHash } = useWriteContract();
  const { writeContract: writeUnstake, isPending: isUnstakeLoading, data: unstakeHash } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isApproveWaiting, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: !!approveHash }
  });

  const { isLoading: isStakeWaiting, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
    query: { enabled: !!stakeHash }
  });

  const { isLoading: isUnstakeWaiting, isSuccess: isUnstakeSuccess } = useWaitForTransactionReceipt({
    hash: unstakeHash,
    query: { enabled: !!unstakeHash }
  });

  // Update balances when data changes
  useEffect(() => {
    if (userBalances && pyusdBalance && isMounted.current) {
      setBalances({
        stakedBalance: Number(formatUnits(userBalances[0], 18)),
        lockedBalance: Number(formatUnits(userBalances[1], 18)),
        availableBalance: Number(formatUnits(userBalances[2], 18)),
        pyusdBalance: Number(formatUnits(pyusdBalance.value, 18)),
      });
    }
  }, [userBalances, pyusdBalance]);

  // Handle successful transactions
  useEffect(() => {
    if (isApproveSuccess && isApproving) {
      // When approval is successful, proceed with staking
      setIsApproving(false);
    }
  }, [isApproveSuccess, isApproving]);

  useEffect(() => {
    if (isStakeSuccess) {
      refetchBalances();
      refetchPyusd();
    }
  }, [isStakeSuccess, refetchBalances, refetchPyusd]);

  useEffect(() => {
    if (isUnstakeSuccess) {
      refetchBalances();
      refetchPyusd();
    }
  }, [isUnstakeSuccess, refetchBalances, refetchPyusd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Stake function
  const stake = async (amount: string) => {
    if (!address) return false;
    
    try {
      const amountInWei = parseUnits(amount, 18);
      
      // First approve the token spending
      setIsApproving(true);
      
      writeApprove({
        address: PYUSD_ADDRESS as `0x${string}`,
        abi: PYUSD_ABI,
        functionName: 'approve',
        args: [STAKING_POOL_ADDRESS as `0x${string}`, amountInWei]
      });
      
      const approvalToast = toast.loading('Approving PYUSD...');
      
      // Watch for approval success
      const approvalCheckInterval = setInterval(() => {
        if (isApproveSuccess) {
          clearInterval(approvalCheckInterval);
          toast.success('Approval successful', { id: approvalToast });
          
          // Then stake
          writeStake({
            address: STAKING_POOL_ADDRESS as `0x${string}`,
            abi: STAKING_POOL_ABI,
            functionName: 'stake',
            args: [amountInWei]
          });
          
          toast.loading('Staking PYUSD...', { id: approvalToast });
        } else if (!isApproveLoading && !isApproveWaiting && !isApproveSuccess) {
          clearInterval(approvalCheckInterval);
          toast.error('Approval failed', { id: approvalToast });
          setIsApproving(false);
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Error in staking process:", error);
      setIsApproving(false);
      return false;
    }
  };

  // Unstake function
  const unstake = async (amount: string) => {
    if (!address) return false;
    
    try {
      const amountInWei = parseUnits(amount, 18);
      
      writeUnstake({
        address: STAKING_POOL_ADDRESS as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: 'unstake',
        args: [amountInWei]
      });
      
      return true;
    } catch (error) {
      console.error("Error in unstaking:", error);
      return false;
    }
  };

  return {
    balances,
    stake,
    unstake,
    isStaking: isApproveLoading || isStakeLoading || isApproveWaiting || isStakeWaiting || isApproving,
    isUnstaking: isUnstakeLoading || isUnstakeWaiting,
    refetchBalances: () => {
      refetchBalances();
      refetchPyusd();
    }
  };
}