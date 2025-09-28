import React from 'react';
import FeatureCard from './FeatureCard';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      title: "STAKING",
      description: "Stake your assets to earn rewards and participate in governance while securing the network.",
      href: "/dashboard/stake",
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      title: "LENDING",
      description: "Supply assets to earn interest and provide liquidity to the protocol with competitive rates.",
      href: "/dashboard/lend", 
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      )
    },
    {
      title: "BORROWING",
      description: "Borrow assets against your collateral at competitive rates with flexible terms.",
      href: "/dashboard/borrow",
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      )
    },
    {
      title: "GOVERANCE",
      description: "Participate in protocol governance by voting on proposals and shaping the future.",
      href: "/dashboard/governance",
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      )
    },
    {
      title: "ANALYTICS",
      description: "Track your portfolio performance with detailed analytics and market insights.",
      href: "/dashboard/analytics",
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
        </svg>
      )
    },
    {
      title: "PORTFOLIO",
      description: "Manage and monitor your complete DeFi portfolio across all protocols and chains.",
      href: "/dashboard/portfolio",
      iconSvg: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="relative bg-black py-12 overflow-hidden">
      {/* Uniform Grid background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Border lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white opacity-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              iconSvg={feature.iconSvg}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;