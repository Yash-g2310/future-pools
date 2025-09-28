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

// Enhanced animated grid background component with 3D street effect
const AnimatedGridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* 3D Perspective Grid - Street Effect */}
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
        <defs>
          {/* Perspective grid pattern */}
          <pattern id="perspectiveGrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path 
              d="M 0 0 L 80 0 M 0 0 L 0 80" 
              fill="none" 
              stroke="rgba(34, 211, 238, 0.4)" 
              strokeWidth="1"
            />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              values="0,0; 0,80; 0,0"
              dur="4s"
              repeatCount="indefinite"
            />
          </pattern>
          
          {/* Vanishing point grid lines */}
          <g id="vanishingLines">
            {/* Horizontal lines that converge */}
            {[...Array(12)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={50 + i * 45}
                x2="800"
                y2={200 + i * 25}
                stroke="rgba(34, 211, 238, 0.3)"
                strokeWidth="1"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur={`${3 + i * 0.2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.1}s`}
                />
              </line>
            ))}
            
            {/* Vertical lines that converge to center */}
            {[...Array(16)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="600"
                x2={350 + (i - 8) * 12}
                y2="150"
                stroke="rgba(34, 211, 238, 0.25)"
                strokeWidth="1"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.3;0.1"
                  dur={`${4 + i * 0.15}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.05}s`}
                />
              </line>
            ))}
          </g>
        </defs>
        
        {/* Main perspective grid */}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#perspectiveGrid)"
          style={{
            transform: 'perspective(600px) rotateX(75deg)',
            transformOrigin: 'center bottom'
          }}
        />
        
        {/* Vanishing point lines */}
        <use href="#vanishingLines" />
        
        {/* Center vanishing point glow */}
        <circle
          cx="400"
          cy="180"
          r="3"
          fill="rgba(34, 211, 238, 0.6)"
        >
          <animate
            attributeName="r"
            values="2;5;2"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.8;0.4"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>

    {/* Floating particles with depth */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-cyan-400 rounded-full opacity-30"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 4) * 18}%`,
            animation: `floatDepth ${2.5 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`
          }}
        />
      ))}
    </div>
  </div>
);

// Enhanced coin/logo component with SVG icons
const AnimatedCoinLogo = () => (
  <div className="relative mb-8">
    <div className="relative">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-15 blur-lg scale-125"></div>
      
      {/* First coin */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-500 p-1 transform hover:scale-110 transition-transform duration-300">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {/* Dollar SVG Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Second coin (overlapping) */}
      <div className="absolute -right-6 top-2 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-500 p-1 transform hover:scale-110 transition-transform duration-300">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            {/* Bank SVG Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21H21M5 21V7L12 3L19 7V21M9 9V13M15 9V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Connected wallet display component
const ConnectedWalletDisplay = ({ address, chainId, onDisconnect }: WalletDisplayProps) => (
  <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
    <style jsx>{`
      @import url('https://fonts.googleapis.com/css2?family=VT323:wght@400&family=Orbitron:wght@400;700;900&display=swap');
      
      @keyframes floatDepth {
        0%, 100% { 
          transform: translateY(0px); 
          opacity: 0.2;
        }
        50% { 
          transform: translateY(-20px); 
          opacity: 0.6;
        }
      }
      
      .font-pixel { font-family: 'Orbitron', monospace; }
      .font-vt323 { font-family: 'VT323', monospace; }
    `}</style>

    <div className="absolute inset-0 border-2 border-cyan-500 m-4 rounded-2xl">
      <AnimatedGridBackground />
      
      {/* Header */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold font-pixel text-cyan-300">FUTURE POOLS</h1>
      </div>
      
      <div className="absolute top-6 right-6">
        <button
          onClick={onDisconnect}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-all duration-300 hover:scale-105 font-pixel"
        >
          DISCONNECT
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
        <AnimatedCoinLogo />
        
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl leading-tight font-vt323 text-cyan-200">
          Wallet Connected Successfully!
        </h2>
        
        <div className="text-center mb-8 max-w-2xl">
          <p className="text-lg text-gray-300 font-pixel">
            Your wallet is connected to our DeFi lending and staking platform with <span className="text-yellow-400">PYUSD</span> support.
          </p>
          <p className="text-lg text-gray-300 mt-2 font-pixel">
            Ready to start lending or borrowing with smart escrow contracts.
          </p>
        </div>

        {/* Enhanced wallet info card */}
        <div className="bg-[#1e293b] border border-cyan-500/30 rounded-xl p-6 mb-8 w-full max-w-md hover:border-cyan-500/60 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-cyan-300 font-pixel">Connected</span>
            </div>
            <span className="text-gray-400 text-sm font-pixel">Chain: {chainId}</span>
          </div>
          <div className="bg-[#0f172a] rounded-lg p-3 mb-4 border border-cyan-500/20">
            <p className="text-white font-mono text-sm break-all">{address}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(address || '')}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors font-pixel hover:scale-105 transform duration-200"
          >
            <svg className="inline w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8" stroke="currentColor" strokeWidth="2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Copy Address
          </button>
        </div>

        <button
          onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          className="bg-cyan-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-cyan-700 transition-all duration-300 mb-4 font-pixel hover:scale-105 transform"
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
      className="bg-cyan-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 w-full max-w-xs font-pixel hover:scale-105 transform"
    >
      {isPending ? (
        <span>CONNECTING...</span>
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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

  // Filter out injected connectors
  const filteredConnectors = connectors.filter(connector => 
    connector.id !== 'io.metamask' && connector.name.toLowerCase() !== 'injected'
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323:wght@400&family=Orbitron:wght@400;700;900&display=swap');
        
        @keyframes floatDepth {
          0%, 100% { 
            transform: translateY(0px); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-20px); 
            opacity: 0.6;
          }
        }
        
        .font-pixel { font-family: 'Orbitron', monospace; }
        .font-vt323 { font-family: 'VT323', monospace; }
      `}</style>

      {/* Main container with border */}
      <div className="absolute inset-0 border-2 border-cyan-500 m-4 rounded-2xl">
        <AnimatedGridBackground />
        
        {/* Header */}
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-2xl font-bold font-pixel text-cyan-300">FUTURE POOLS</h1>
        </div>
        
        <div className="absolute top-6 right-6 z-20">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed font-pixel">
            CONNECT WALLET
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-10">
          <AnimatedCoinLogo />
          
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl leading-tight font-vt323 text-cyan-200">
            Access Your DeFi Lending and Staking Platform!
          </h2>
          
          <div className="text-center mb-8 max-w-2xl">
            <p className="text-lg text-gray-300 font-pixel">
              Connect your wallet to access decentralized lending with <span className="text-yellow-400">PYUSD Tokens</span>.
            </p>
            <p className="text-lg text-gray-300 mt-2 font-pixel">
              Start lending or borrowing with secure smart escrow contracts.
            </p>
          </div>

          {/* Enhanced connection buttons */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {filteredConnectors.length > 0 ? (
              filteredConnectors.slice(0, 2).map((connector) => (
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

          {/* Enhanced social icons with SVGs */}
          <div className="flex gap-1">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-300 hover:scale-110 transform hover:shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174c-.105-.949-.199-2.403.041-3.439c.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911c1.024 0 1.518.769 1.518 1.688c0 1.029-.653 2.567-.992 3.992c-.285 1.193.6 2.165 1.775 2.165c2.128 0 3.768-2.245 3.768-5.487c0-2.861-2.063-4.869-5.008-4.869c-3.41 0-5.409 2.562-5.409 5.199c0 1.033.394 2.143.889 2.741c.099.12.112.225.085.345c-.09.375-.293 1.199-.334 1.363c-.053.225-.172.271-.402.159c-1.499-.69-2.436-2.888-2.436-4.649c0-3.785 2.75-7.262 7.929-7.262c4.163 0 7.398 2.967 7.398 6.931c0 4.136-2.607 7.464-6.227 7.464c-1.216 0-2.357-.631-2.75-1.378c0 0-.518 1.985-.666 2.46c-.253.965-.94 2.404-1.337 3.174c1.027.317 2.113.482 3.25.482c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}