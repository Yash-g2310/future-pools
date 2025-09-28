'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useStakingPool } from '../../../hooks/useStakingPool';

export default function StakingPositions() {
  const { address } = useAccount();
  const { balances } = useStakingPool();

  // Convert balances to position format for display
  const stakingPosition = address ? {
    id: 1,
    amount: balances.stakedBalance,
    locked: balances.lockedBalance,
    available: balances.availableBalance,
    apy: '4.5%', // Typically this would come from a contract too
  } : null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white font-vt323">YOUR STAKING POSITION</h2>
      </div>
      
      {stakingPosition ? (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 p-6 rounded-lg">
              <div className="text-gray-400 mb-2">Total Staked</div>
              <div className="text-white text-2xl font-bold">{stakingPosition.amount.toFixed(2)} PYUSD</div>
              <div className="text-cyan-400 text-sm mt-1">APY: {stakingPosition.apy}</div>
            </div>
            
            <div className="bg-gray-700/30 p-6 rounded-lg">
              <div className="text-gray-400 mb-2">Available to Unstake</div>
              <div className="text-white text-2xl font-bold">{stakingPosition.available.toFixed(2)} PYUSD</div>
              <div className="text-yellow-400 text-sm mt-1">Locked: {stakingPosition.locked.toFixed(2)} PYUSD</div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-700/30 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-white">Staking Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Locked Percentage</div>
                <div className="text-white font-medium">
                  {stakingPosition.amount > 0 
                    ? ((stakingPosition.locked / stakingPosition.amount) * 100).toFixed(2)
                    : '0'}%
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm">Available Percentage</div>
                <div className="text-white font-medium">
                  {stakingPosition.amount > 0 
                    ? ((stakingPosition.available / stakingPosition.amount) * 100).toFixed(2)
                    : '0'}%
                </div>
              </div>
            </div>
            
            {/* Simple progress bar for visualizing locked vs available */}
            <div className="mt-4">
              <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-cyan-500 h-2.5 rounded-full" 
                  style={{ 
                    width: `${stakingPosition.amount > 0 
                      ? ((stakingPosition.available / stakingPosition.amount) * 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Available: {((stakingPosition.available / stakingPosition.amount) * 100).toFixed(0)}%</span>
                <span>Locked: {((stakingPosition.locked / stakingPosition.amount) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400">
          <p>You don't have any active staking positions.</p>
          <p className="mt-2">Start staking PYUSD to earn rewards!</p>
        </div>
      )}
    </div>
  );
}