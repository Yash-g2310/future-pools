'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useStakingPool } from '../../../hooks/useStakingPool';
import { toast } from 'react-hot-toast'; // Install this package if not already

export default function StakingForm() {
  const [amount, setAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(true); // true = stake, false = unstake
  const { address } = useAccount();
  const { balances, stake, unstake, isStaking: isStakingLoading, isUnstaking } = useStakingPool();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !address) return;
    
    try {
      const loadingToast = toast.loading(
        `${isStaking ? 'Staking' : 'Unstaking'} ${amount} PYUSD...`
      );
      
      if (isStaking) {
        const success = await stake(amount);
        if (success) {
          toast.success(`Successfully staked ${amount} PYUSD`, { id: loadingToast });
        } else {
          toast.error('Transaction failed', { id: loadingToast });
        }
      } else {
        const success = await unstake(amount);
        if (success) {
          toast.success(`Successfully unstaked ${amount} PYUSD`, { id: loadingToast });
        } else {
          toast.error('Transaction failed', { id: loadingToast });
        }
      }
      
      // Reset form after successful transaction
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed');
    }
  };
  
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
            onClick={() => setIsStaking(true)}
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
            onClick={() => setIsStaking(false)}
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
              onChange={(e) => setAmount(e.target.value)}
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
              onClick={() => setAmount(isStaking ? balances.pyusdBalance.toString() : balances.availableBalance.toString())}
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
    </div>
  );
}