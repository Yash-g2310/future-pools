'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { Connector } from 'wagmi';

interface WalletConnectPageProps {
  onWalletConnected: () => void;
}

interface WalletDisplayProps {
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  onDisconnect: () => void;
}

// Animated grid background component
const AnimatedGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Left perspective grid with animation */}
    <div className="absolute left-0 top-0 w-1/2 h-full">
      <svg className="w-full h-full animate-pulse" viewBox="0 0 400 800" preserveAspectRatio="none">
        <defs>
          <pattern id="leftGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="rgba(153, 239, 228, 0.3)" 
              strokeWidth="1.5"
              className="animate-pulse"
            />
          </pattern>
          <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(153, 239, 228, 0.1)" />
            <stop offset="100%" stopColor="rgba(153, 239, 228, 0)" />
          </linearGradient>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#leftGrid)" 
          style={{
            transform: 'perspective(800px) rotateY(25deg) translateX(-10%)',
            animation: 'gridPulse 4s ease-in-out infinite'
          }}
        />
        <rect width="100%" height="100%" fill="url(#leftFade)" />
      </svg>
    </div>
    
    {/* Right perspective grid with animation */}
    <div className="absolute right-0 top-0 w-1/2 h-full">
      <svg className="w-full h-full animate-pulse" viewBox="0 0 400 800" preserveAspectRatio="none">
        <defs>
          <pattern id="rightGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 0 L 50 0 50 50" 
              fill="none" 
              stroke="rgba(153, 239, 228, 0.3)" 
              strokeWidth="1.5"
              className="animate-pulse"
            />
          </pattern>
          <linearGradient id="rightFade" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(153, 239, 228, 0.1)" />
            <stop offset="100%" stopColor="rgba(153, 239, 228, 0)" />
          </linearGradient>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#rightGrid)" 
          style={{
            transform: 'perspective(800px) rotateY(-25deg) translateX(10%)',
            animation: 'gridPulse 4s ease-in-out infinite reverse'
          }}
        />
        <rect width="100%" height="100%" fill="url(#rightFade)" />
      </svg>
    </div>

    {/* Floating particles */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#99EFE4] rounded-full opacity-60"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.5}s`
          }}
        />
      ))}
    </div>
  </div>
);

// Enhanced coin/logo component with animations
const AnimatedCoinLogo = () => (
  <div className="relative mb-8">
    <div className="relative">
      {/* Animated glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C684F6] to-[#97F0E5] opacity-30 blur-xl animate-pulse scale-150"></div>
      
      {/* First coin with hover animation */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C684F6] via-[#97F0E5] to-[#C684F6] p-1 transform hover:scale-110 transition-transform duration-300 animate-bounce-slow">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#97F0E5] to-[#C684F6] flex items-center justify-center relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine"></div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl animate-bounce">💰</span>
          </div>
        </div>
      </div>
      
      {/* Second coin (overlapping) with different animation */}
      <div className="absolute -right-6 top-2 w-24 h-24 rounded-full bg-gradient-to-br from-[#97F0E5] via-[#C684F6] to-[#97F0E5] p-1 transform hover:scale-110 transition-transform duration-300 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C684F6] to-[#97F0E5] flex items-center justify-center relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine" style={{ animationDelay: '1s' }}></div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🏦</span>
          </div>
        </div>
      </div>

      {/* Floating sparkles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-70"
          style={{
            left: `${-10 + i * 30}%`,
            top: `${-10 + (i % 2) * 40}%`,
            animation: `sparkle ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`
          }}
        />
      ))}
    </div>
  </div>
);

// Connected wallet display component with animations
const ConnectedWalletDisplay = ({ address, chainId, onDisconnect }: WalletDisplayProps) => (
  <div className="min-h-screen bg-[#1a1d2e] text-white relative overflow-hidden font-mono">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
      
      @keyframes gridPulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes shine {
        0% { transform: translateX(-100%) skewX(-12deg); }
        100% { transform: translateX(200%) skewX(-12deg); }
      }
      
      @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes textGlow {
        0%, 100% { text-shadow: 0 0 10px rgba(153, 239, 228, 0.5); }
        50% { text-shadow: 0 0 20px rgba(153, 239, 228, 0.8), 0 0 30px rgba(198, 132, 246, 0.5); }
      }
      
      .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      .animate-shine { animation: shine 2s ease-in-out infinite; }
      .animate-text-glow { animation: textGlow 3s ease-in-out infinite; }
      .font-pixel { font-family: 'Orbitron', monospace; }
    `}</style>

    <div className="absolute inset-0 border-2 border-[#99EFE4] m-4 rounded-2xl">
      <AnimatedGridBackground />
      
      {/* Header */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold font-pixel animate-text-glow">DEFI LENDING</h1>
      </div>
      
      <div className="absolute top-6 right-6">
        <button
          onClick={onDisconnect}
          className="bg-[#C684F6] text-[#1a1d2e] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105 font-pixel"
        >
          DISCONNECT
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
        <AnimatedCoinLogo />
        
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl leading-tight font-pixel animate-text-glow">
          Wallet Connected Successfully!
        </h2>
        
        <div className="text-center mb-8 max-w-2xl">
          <p className="text-lg text-gray-300 font-pixel">
            Your wallet is connected to our DeFi lending platform with <span className="text-[#F4DB58] animate-pulse">PYUSD</span> support.
          </p>
          <p className="text-lg text-gray-300 mt-2 font-pixel">
            Ready to start lending or borrowing with smart escrow contracts.
          </p>
        </div>

        {/* Enhanced wallet info card */}
        <div className="bg-[#2a2d3e] border border-[#99EFE4]/30 rounded-xl p-6 mb-8 w-full max-w-md hover:border-[#99EFE4]/60 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[#99EFE4] font-pixel">Connected</span>
            </div>
            <span className="text-gray-400 text-sm font-pixel">Chain: {chainId}</span>
          </div>
          <div className="bg-[#1a1d2e] rounded-lg p-3 mb-4 border border-[#99EFE4]/20">
            <p className="text-white font-mono text-sm break-all">{address}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(address || '')}
            className="text-[#C684F6] text-sm hover:opacity-80 transition-opacity font-pixel hover:scale-105 transform duration-200"
          >
            📋 Copy Address
          </button>
        </div>

        <button
          onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          className="bg-[#C684F6] text-[#1a1d2e] px-8 py-4 rounded-xl text-xl font-bold hover:opacity-90 transition-all duration-300 mb-4 font-pixel hover:scale-105 transform"
        >
          VIEW ON ETHERSCAN
        </button>

        <p className="text-sm text-gray-400 text-center max-w-md font-pixel">
          By continuing, you agree to our{' '}
          <span className="underline cursor-pointer hover:text-white transition-colors">Terms of Use</span> and{' '}
          <span className="underline cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  </div>
);

// Enhanced wallet connector button component
const WalletConnectorButton = ({
  connector,
  isPending,
  onClick,
}: {
  connector: Connector;
  isPending: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="bg-[#C684F6] text-[#1a1d2e] px-8 py-4 rounded-xl text-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 w-full max-w-xs font-pixel hover:scale-105 transform hover:shadow-lg hover:shadow-[#C684F6]/25"
    >
      {isPending ? (
        <span className="animate-pulse">CONNECTING...</span>
      ) : (
        `CONNECT ${connector.name.toUpperCase()}`
      )}
    </button>
  );
};

// Main component
export default function WalletConnectPage({ onWalletConnected }: WalletConnectPageProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      const timer = setTimeout(onWalletConnected, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, onWalletConnected]);

  const handleConnect = useCallback(async (connector: Connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect]);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C684F6]"></div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <ConnectedWalletDisplay
        address={address}
        chainId={chainId}
        onDisconnect={disconnect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] text-white relative overflow-hidden font-mono">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(153, 239, 228, 0.5); }
          50% { text-shadow: 0 0 20px rgba(153, 239, 228, 0.8), 0 0 30px rgba(198, 132, 246, 0.5); }
        }
        
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-shine { animation: shine 2s ease-in-out infinite; }
        .animate-text-glow { animation: textGlow 3s ease-in-out infinite; }
        .font-pixel { font-family: 'Orbitron', monospace; }
      `}</style>

      {/* Main container with border */}
      <div className="absolute inset-0 border-2 border-[#99EFE4] m-4 rounded-2xl">
        <AnimatedGridBackground />
        
        {/* Header */}
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-2xl font-bold font-pixel animate-text-glow">DEFI LENDING</h1>
        </div>
        
        <div className="absolute top-6 right-6 z-20">
          <button className="bg-[#C684F6] text-[#1a1d2e] px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed font-pixel">
            CONNECT WALLET
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
          <AnimatedCoinLogo />
          
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl leading-tight font-pixel animate-text-glow">
            Access Your DeFi Lending Platform!
          </h2>
          
          <div className="text-center mb-8 max-w-2xl">
            <p className="text-lg text-gray-300 font-pixel">
              Connect your wallet to access decentralized lending with <span className="text-[#F4DB58] animate-pulse">PYUSD Tokens</span>.
            </p>
            <p className="text-lg text-gray-300 mt-2 font-pixel">
              Start lending or borrowing with secure smart escrow contracts.
            </p>
          </div>

          {/* Enhanced connection buttons */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {connectors.length > 0 ? (
              connectors.slice(0, 2).map((connector) => (
                <WalletConnectorButton
                  key={connector.id}
                  connector={connector}
                  isPending={isPending}
                  onClick={() => handleConnect(connector)}
                />
              ))
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center hover:border-red-500/50 transition-all duration-300">
                <p className="text-red-400 font-medium mb-2 font-pixel">No wallet connectors available</p>
                <p className="text-sm text-gray-400 font-pixel">
                  Please install a Web3 wallet like MetaMask.
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-400 text-center max-w-md font-pixel">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-white transition-colors">Terms of Use</span> and{' '}
            <span className="underline cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex justify-between items-end">
          {/* Left links */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 font-pixel">
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Platform Website</span>
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Whitepaper</span>
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Explorer</span>
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Media Kit</span>
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Terms and Conditions</span>
            <span className="cursor-pointer hover:text-white transition-colors hover:scale-105 transform duration-200">Privacy Policy</span>
          </div>

          {/* Enhanced social icons */}
          <div className="flex gap-1">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <span className="text-black text-2xl font-bold">𝕏</span>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <span className="text-black text-2xl">💬</span>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <span className="text-black text-2xl">⚡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}