'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import Image from 'next/image';
// import logo from '../../../public/assets/images/logo.svg';

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
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        {/* <Image src={logo} alt="Logo" width={40} height={40} /> */}
        <h1 className="ml-2 text-xl font-bold">Future Pools</h1>
      </div>
      <div className="flex items-center gap-4">
        {address && (
          <>
            <span className="text-sm">
              Connected as: {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;