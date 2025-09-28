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

const STAKING_POOL_ADDRESS = '0x3e2aa34c333474e3692abfb7a3f97a44173d0401';
const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9';

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
  const [lastError, setLastError] = useState<string | null>(null);
  const [transactionState, setTransactionState] = useState<string>('idle');
  
  const [balances, setBalances] = useState({
    stakedBalance: 0,
    lockedBalance: 0,
    availableBalance: 0,
    pyusdBalance: 0,
  });
  
  const isMounted = useRef(true);

  // Get PYUSD balance
  const { data: pyusdBalance, refetch: refetchPyusd, error: pyusdBalanceError } = useBalance({
    address,
    token: PYUSD_ADDRESS as `0x${string}`,
    query: { enabled: !!address }
  });

  // Get staking balances
  const { 
    data: userBalances, 
    refetch: refetchBalances, 
    error: userBalancesError 
  } = useReadContract({
    address: STAKING_POOL_ADDRESS as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Write contract hooks
  const { 
    writeContract: writeApprove, 
    isPending: isApproveLoading, 
    data: approveHash,
    error: approveError
  } = useWriteContract();
  
  const { 
    writeContract: writeStake, 
    isPending: isStakeLoading, 
    data: stakeHash,
    error: stakeError 
  } = useWriteContract();
  
  const { 
    writeContract: writeUnstake, 
    isPending: isUnstakeLoading, 
    data: unstakeHash,
    error: unstakeError
  } = useWriteContract();

  // Transaction receipt hooks
  const { 
    isLoading: isApproveWaiting, 
    isSuccess: isApproveSuccess,
    error: approveReceiptError
  } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: !!approveHash }
  });

  const { 
    isLoading: isStakeWaiting, 
    isSuccess: isStakeSuccess,
    error: stakeReceiptError
  } = useWaitForTransactionReceipt({
    hash: stakeHash,
    query: { enabled: !!stakeHash }
  });

  const { 
    isLoading: isUnstakeWaiting, 
    isSuccess: isUnstakeSuccess,
    error: unstakeReceiptError
  } = useWaitForTransactionReceipt({
    hash: unstakeHash,
    query: { enabled: !!unstakeHash }
  });

  // Log errors from hooks
  useEffect(() => {
    if (pyusdBalanceError) {
      console.error("❌ PYUSD Balance Error:", pyusdBalanceError);
      setLastError(`PYUSD Balance Error: ${pyusdBalanceError.message}`);
    }
    
    if (userBalancesError) {
      console.error("❌ User Balances Error:", userBalancesError);
      setLastError(`User Balances Error: ${userBalancesError.message}`);
    }
  }, [pyusdBalanceError, userBalancesError]);

  useEffect(() => {
    const txError = approveError || stakeError || unstakeError || 
                    approveReceiptError || stakeReceiptError || unstakeReceiptError;
    
    if (txError) {
      console.error("❌ Transaction Error:", txError);
      setLastError(`Transaction Error: ${txError.message}`);
    }
  }, [
    approveError, stakeError, unstakeError,
    approveReceiptError, stakeReceiptError, unstakeReceiptError
  ]);

  // Update balances when data changes
  useEffect(() => {
    console.log("📊 Raw user balances data:", userBalances);
    console.log("📊 Raw PYUSD balance data:", pyusdBalance);
    
    if (userBalances && pyusdBalance && isMounted.current) {
      const newBalances = {
        stakedBalance: Number(formatUnits(userBalances[0], 18)),
        lockedBalance: Number(formatUnits(userBalances[1], 18)),
        availableBalance: Number(formatUnits(userBalances[2], 18)),
        pyusdBalance: Number(formatUnits(pyusdBalance.value, 18)),
      };
      
      console.log("💰 Updating balances:", newBalances);
      setBalances(newBalances);
    }
  }, [userBalances, pyusdBalance]);

  // Handle approval transaction state
  useEffect(() => {
    console.log("🔄 Approval state change:", { 
      isApproveLoading, 
      isApproveWaiting, 
      isApproveSuccess, 
      isApproving 
    });
    
    if (isApproveSuccess && isApproving) {
      console.log("✅ Approval successful, ready to stake");
      setTransactionState('approval_success');
      setIsApproving(false);
    }
  }, [isApproveSuccess, isApproving, isApproveLoading, isApproveWaiting]);

  // Handle stake transaction state
  useEffect(() => {
    console.log("🔄 Stake state change:", { 
      isStakeLoading, 
      isStakeWaiting, 
      isStakeSuccess 
    });
    
    if (isStakeSuccess) {
      console.log("✅ Staking successful, refreshing balances");
      setTransactionState('stake_success');
      refetchBalances();
      refetchPyusd();
    }
  }, [isStakeSuccess, isStakeLoading, isStakeWaiting, refetchBalances, refetchPyusd]);

  // Handle unstake transaction state
  useEffect(() => {
    console.log("🔄 Unstake state change:", { 
      isUnstakeLoading, 
      isUnstakeWaiting, 
      isUnstakeSuccess 
    });
    
    if (isUnstakeSuccess) {
      console.log("✅ Unstaking successful, refreshing balances");
      setTransactionState('unstake_success');
      refetchBalances();
      refetchPyusd();
    }
  }, [isUnstakeSuccess, isUnstakeLoading, isUnstakeWaiting, refetchBalances, refetchPyusd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up useStakingPool hook");
      isMounted.current = false;
    };
  }, []);

  // Stake function
  const stake = async (amount: string) => {
    if (!address) {
      console.error("❌ Cannot stake: no connected address");
      setLastError("No wallet connected");
      return false;
    }
    
    setLastError(null);
    
    try {
      const amountInWei = parseUnits(amount, 18);
      console.log(`🚀 Starting stake process for ${amount} PYUSD (${amountInWei} wei)`);
      
      // First approve the token spending
      setIsApproving(true);
      setTransactionState('approving');
      
      console.log("📝 Sending approval transaction");
      writeApprove({
        address: PYUSD_ADDRESS as `0x${string}`,
        abi: PYUSD_ABI,
        functionName: 'approve',
        args: [STAKING_POOL_ADDRESS as `0x${string}`, amountInWei]
      });
      
      console.log("⏳ Waiting for approval transaction hash");
      if (!approveHash) {
        const waitForApprovalHash = new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            console.log(`⏳ Checking for approval hash (attempt ${attempts})`);
            
            if (approveHash) {
              console.log("✅ Approval hash received:", approveHash);
              clearInterval(checkInterval);
              resolve();
            } else if (attempts > 30) {  // 30 second timeout
              console.error("❌ Approval hash timeout");
              clearInterval(checkInterval);
              reject(new Error("Approval transaction timeout"));
            }
            
            if (approveError) {
              console.error("❌ Approval error:", approveError);
              clearInterval(checkInterval);
              reject(approveError);
            }
          }, 1000);
        });
        
        try {
          await waitForApprovalHash;
        } catch (error) {
          console.error("Failed waiting for approval hash:", error);
          setIsApproving(false);
          setTransactionState('approval_failed');
          setLastError(error instanceof Error ? error.message : 'Unknown error waiting for approval');
          return false;
        }
      }
      
      console.log("⏳ Waiting for approval receipt");
      const waitForApproval = new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          console.log(`⏳ Checking approval status (attempt ${attempts})`);
          
          if (isApproveSuccess) {
            console.log("✅ Approval confirmed on blockchain");
            clearInterval(checkInterval);
            resolve();
          } else if (attempts > 60) {  // 1 minute timeout
            console.error("❌ Approval confirmation timeout");
            clearInterval(checkInterval);
            reject(new Error("Approval confirmation timeout"));
          }
          
          if (approveReceiptError) {
            console.error("❌ Approval receipt error:", approveReceiptError);
            clearInterval(checkInterval);
            reject(approveReceiptError);
          }
        }, 1000);
      });
      
      try {
        await waitForApproval;
        setTransactionState('approved');
      } catch (error) {
        console.error("Failed waiting for approval:", error);
        setIsApproving(false);
        setTransactionState('approval_failed');
        setLastError(error instanceof Error ? error.message : 'Unknown error in approval');
        return false;
      }
      
      // Then stake
      console.log("📝 Sending stake transaction");
      setTransactionState('staking');
      
      writeStake({
        address: STAKING_POOL_ADDRESS as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: 'stake',
        args: [amountInWei]
      });
      
      console.log("⏳ Waiting for stake transaction hash");
      if (!stakeHash) {
        const waitForStakeHash = new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            console.log(`⏳ Checking for stake hash (attempt ${attempts})`);
            
            if (stakeHash) {
              console.log("✅ Stake hash received:", stakeHash);
              clearInterval(checkInterval);
              resolve();
            } else if (attempts > 30) {
              console.error("❌ Stake hash timeout");
              clearInterval(checkInterval);
              reject(new Error("Stake transaction timeout"));
            }
            
            if (stakeError) {
              console.error("❌ Stake error:", stakeError);
              clearInterval(checkInterval);
              reject(stakeError);
            }
          }, 1000);
        });
        
        try {
          await waitForStakeHash;
        } catch (error) {
          console.error("Failed waiting for stake hash:", error);
          setTransactionState('stake_failed');
          setLastError(error instanceof Error ? error.message : 'Unknown error waiting for stake');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("💥 Error in staking process:", error);
      setIsApproving(false);
      setTransactionState('error');
      setLastError(error instanceof Error ? error.message : 'Unknown error in staking');
      return false;
    }
  };

  // Unstake function
  const unstake = async (amount: string) => {
    if (!address) {
      console.error("❌ Cannot unstake: no connected address");
      setLastError("No wallet connected");
      return false;
    }
    
    setLastError(null);
    setTransactionState('unstaking');
    
    try {
      const amountInWei = parseUnits(amount, 18);
      console.log(`🚀 Starting unstake process for ${amount} PYUSD (${amountInWei} wei)`);
      
      console.log("📝 Sending unstake transaction");
      writeUnstake({
        address: STAKING_POOL_ADDRESS as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: 'unstake',
        args: [amountInWei]
      });
      
      return true;
    } catch (error) {
      console.error("💥 Error in unstaking:", error);
      setTransactionState('error');
      setLastError(error instanceof Error ? error.message : 'Unknown error in unstaking');
      return false;
    }
  };

  return {
    balances,
    stake,
    unstake,
    isStaking: isApproveLoading || isStakeLoading || isApproveWaiting || isStakeWaiting || isApproving,
    isUnstaking: isUnstakeLoading || isUnstakeWaiting,
    lastError,
    transactionState,
    refetchBalances: () => {
      console.log("🔄 Manual refresh of balances requested");
      refetchBalances();
      refetchPyusd();
    }
  };
}