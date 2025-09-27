import React from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import logo from '../../../public/assets/images/logo.svg';

const DashboardHeader = () => {
  const { address } = useAccount();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        <Image src={logo} alt="Logo" width={40} height={40} />
        <h1 className="ml-2 text-xl font-bold">Dashboard</h1>
      </div>
      <div>
        {address && (
          <span className="text-sm">
            Connected as: {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;