'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';

export default function StakingForm() {
  const [amount, setAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(true); // true = stake, false = unstake
  const { address } = useAccount();
  
  // Mock balances - would come from contract in real implementation
  const availableBalance = 1000;
  const stakedBalance = 500;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) return;
    
    try {
      console.log(`${isStaking ? 'Staking' : 'Unstaking'} ${amount} PYUSD`);
      // Implementation would call the contract function here
      // For staking: stakingContract.stake(amount)
      // For unstaking: stakingContract.unstake(amount)
      
      // Reset form after successful transaction
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white font-vt323">STAKING PORTAL</h2>
        
        {/* Toggle between stake/unstake */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
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
              {isStaking ? 'Available:' : 'Staked:'} {isStaking ? availableBalance : stakedBalance} PYUSD
            </span>
            <button 
              type="button"
              className="text-blue-400 hover:text-blue-300"
              onClick={() => setAmount(isStaking ? availableBalance.toString() : stakedBalance.toString())}
            >
              MAX
            </button>
          </div>
        </div>
        
        {/* Balance Info */}
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available Balance:</span>
            <span className="text-white font-medium">{availableBalance} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Staked Balance:</span>
            <span className="text-white font-medium">{stakedBalance} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Balance:</span>
            <span className="text-white font-medium">{availableBalance + stakedBalance} PYUSD</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          disabled={!amount || Number(amount) <= 0}
        >
          {isStaking ? 'Stake PYUSD' : 'Unstake PYUSD'}
        </button>
      </form>
    </div>
  );
}