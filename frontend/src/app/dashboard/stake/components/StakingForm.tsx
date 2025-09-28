'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakingPool } from '../../../hooks/useStakingPool';
import { toast } from 'react-hot-toast'; // Install this package if not already

export default function StakingForm() {
  const [amount, setAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(true); // true = stake, false = unstake
  const { address } = useAccount();
  const { 
    balances, 
    stake, 
    unstake, 
    isStaking: isStakingLoading, 
    isUnstaking,
    lastError,
    transactionState,
    refetchBalances
  } = useStakingPool();

  // Debug logging for component renders and state changes
  console.log('🔍 StakingForm rendering:', { 
    address, 
    amount, 
    isStaking, 
    isStakingLoading, 
    isUnstaking,
    balances,
    transactionState,
    lastError
  });
  
  // Log when account changes
  useEffect(() => {
    console.log('👤 Account changed:', address);
    if (address) {
      refetchBalances();
    }
  }, [address, refetchBalances]);

  // Log when balances update
  useEffect(() => {
    console.log('💰 Balances updated:', balances);
  }, [balances]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !address) {
      console.log('❌ Form submission blocked:', { amount, address });
      return;
    }
    
    try {
      console.log(`🚀 Initiating ${isStaking ? 'stake' : 'unstake'} for ${amount} PYUSD`);
      const loadingToast = toast.loading(
        `${isStaking ? 'Staking' : 'Unstaking'} ${amount} PYUSD...`
      );
      
      if (isStaking) {
        console.log('📝 Calling stake function with amount:', amount);
        const success = await stake(amount);
        console.log('📊 Stake result:', success);
        
        if (success) {
          toast.success(`Successfully staked ${amount} PYUSD`, { id: loadingToast });
        } else {
          toast.error(`Failed to stake: ${lastError || 'Unknown error'}`, { id: loadingToast });
          console.error('❌ Staking failed:', lastError);
        }
      } else {
        console.log('📝 Calling unstake function with amount:', amount);
        const success = await unstake(amount);
        console.log('📊 Unstake result:', success);
        
        if (success) {
          toast.success(`Successfully unstaked ${amount} PYUSD`, { id: loadingToast });
        } else {
          toast.error(`Failed to unstake: ${lastError || 'Unknown error'}`, { id: loadingToast });
          console.error('❌ Unstaking failed:', lastError);
        }
      }
      
      // Reset form after successful transaction
      setAmount('');
    } catch (error) {
      console.error('💥 Transaction exception:', error);
      toast.error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Debug status display
  const renderDebugInfo = () => (
    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs font-mono overflow-auto max-h-40">
      <h4 className="text-yellow-400 mb-1">🔍 Debug Information</h4>
      <div className="text-gray-400">
        <div><span className="text-yellow-300">Transaction state:</span> {transactionState}</div>
        <div><span className="text-yellow-300">Is approving:</span> {isStakingLoading ? 'Yes' : 'No'}</div>
        <div><span className="text-yellow-300">Is unstaking:</span> {isUnstaking ? 'Yes' : 'No'}</div>
        <div><span className="text-yellow-300">Last error:</span> {lastError || 'None'}</div>
        <div><span className="text-yellow-300">Connected address:</span> {address || 'Not connected'}</div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white font-vt323">STAKING PORTAL</h2>
        
        {/* Toggle between stake/unstake */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              isStaking 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => {
              console.log('🔄 Switching to Stake mode');
              setIsStaking(true);
            }}
          >
            Stake
          </button>
          <button
            type="button"
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              !isStaking 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => {
              console.log('🔄 Switching to Unstake mode');
              setIsStaking(false);
            }}
          >
            Unstake
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            {isStaking ? 'Stake Amount' : 'Unstake Amount'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                console.log('📝 Amount input changed:', e.target.value);
                setAmount(e.target.value);
              }}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400 text-sm">PYUSD</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>
              {isStaking ? 'Available:' : 'Staked:'} {isStaking ? balances.pyusdBalance.toFixed(2) : balances.stakedBalance.toFixed(2)} PYUSD
            </span>
            <button 
              type="button"
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                const maxValue = isStaking ? balances.pyusdBalance.toString() : balances.availableBalance.toString();
                console.log('🔢 Setting MAX amount:', maxValue);
                setAmount(maxValue);
              }}
            >
              MAX
            </button>
          </div>
        </div>
        
        {/* Balance Info */}
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">PYUSD Balance:</span>
            <span className="text-white font-medium">{balances.pyusdBalance.toFixed(2)} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Staked Balance:</span>
            <span className="text-white font-medium">{balances.stakedBalance.toFixed(2)} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Locked Balance:</span>
            <span className="text-white font-medium">{balances.lockedBalance.toFixed(2)} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available for Unstake:</span>
            <span className="text-white font-medium">{balances.availableBalance.toFixed(2)} PYUSD</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        //   disabled={
        //     !amount || 
        //     Number(amount) <= 0 || 
        //     isStakingLoading || 
        //     isUnstaking || 
        //     (isStaking ? Number(amount) > balances.pyusdBalance : Number(amount) > balances.availableBalance)
        //   }
        >
          {isStakingLoading || isUnstaking ? (
            <span>Processing...</span>
          ) : (
            <span>{isStaking ? 'Stake PYUSD' : 'Unstake PYUSD'}</span>
          )}
        </button>
      </form>
      
      {/* Debug info section */}
      {process.env.NODE_ENV !== 'production' && renderDebugInfo()}
      
      {/* Manual refresh button */}
      <button 
        onClick={() => {
          console.log('🔄 Manual balance refresh requested');
          refetchBalances();
          toast.success('Refreshing balances...');
        }}
        className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors"
      >
        🔄 Refresh Balances
      </button>
    </div>
  );
}