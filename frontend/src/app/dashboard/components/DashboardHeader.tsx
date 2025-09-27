'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import Image from 'next/image';
// We'll use the globe SVG for the logo, but you can replace this with any logo you prefer
import Logo from '../../../../public/globe.svg';

const DashboardHeader = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogout = () => {
    // Clear verification status
    localStorage.removeItem('user_verified');
    // Disconnect wallet
    disconnect();
    // Redirect to home page
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-black border-b border-gray-800 text-white">
      {/* Left side - Logo */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-lg">W</span>
        </div>
        <h1 className="ml-4 text-2xl font-bold tracking-wide text-white">
          <span className="text-cyan-400">FUTURE</span> POOLS
        </h1>
      </div>

      {/* Middle - Navbar */}
      <nav className="hidden md:flex items-center space-x-2">
        {[
          { name: 'DISCOVER', href: '/dashboard' },
          { name: 'BUILD', href: '/dashboard/pools' },
          { name: 'USE', href: '/dashboard/history' },
          { name: 'JOIN', href: '/dashboard/analytics' },
        ].map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="px-6 py-2 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:text-cyan-400 hover:bg-gray-900 rounded-md border border-transparent hover:border-gray-700"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Right side - Wallet status */}
      <div className="flex items-center gap-4">
        {address ? (
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-mono text-gray-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-transparent border border-gray-600 hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-300"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/connect')}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;