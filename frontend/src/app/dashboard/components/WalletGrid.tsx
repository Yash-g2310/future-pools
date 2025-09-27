import React from 'react';
import WalletCard from './WalletCard';

const WalletGrid: React.FC = () => {
  const wallets = [
    {
      title: "SLUSH",
      description: "A powerful multi-platform wallet built for everyone in the Sui ecosystem",
      href: "https://slush.app/",
      logo: <div className="text-4xl font-black">SLUSH</div>
    },
    {
      title: "Wallet",
      description: "A universal crypto wallet available on app, web, and extension",
      href: "https://web3.okx.com/",
      logo: (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded grid grid-cols-2 gap-1 p-1">
            <div className="bg-black rounded-sm"></div>
            <div className="bg-black rounded-sm"></div>
            <div className="bg-black rounded-sm"></div>
            <div className="bg-black rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold">Wallet</span>
        </div>
      )
    },
    {
      title: "phantom",
      description: "A simple multichain wallet, reimagined for DeFi and NFTs",
      href: "https://phantom.com/",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z"/>
          </svg>
          <span className="text-2xl font-bold">phantom</span>
        </div>
      )
    },
    {
      title: "Backpack",
      description: "Self-custody multichain wallet delivering first-class Sui ecosystem experience",
      href: "https://backpack.app/",
      logo: (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold">Backpack</span>
        </div>
      )
    },
    {
      title: "Surf",
      description: "Surf Sui + Walrus with this easy, powerful, and seamless wallet",
      href: "https://surf.tech/",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-2xl font-bold">Surf</span>
        </div>
      )
    },
    {
      title: "Nightly",
      description: "A multi-chain wallet created to embrace the full potential of blockchain",
      href: "https://nightly.app/",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z"/>
          </svg>
          <span className="text-2xl font-bold">Nightly</span>
        </div>
      )
    },
    {
      title: "Suiet",
      description: "Self-custody wallet on Sui, designed for everyone and fully open-sourced",
      href: "https://suiet.app/",
      logo: (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold">Suiet</span>
        </div>
      )
    }
  ];

  return (
    <div className="relative bg-black py-16">
      {/* Vertical border lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-600 opacity-50"></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-600 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet, index) => (
            <WalletCard
              key={index}
              title={wallet.title}
              description={wallet.description}
              href={wallet.href}
              logo={wallet.logo}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-50"></div>
    </div>
  );
};

export default WalletGrid;