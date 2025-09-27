import React from 'react';
import StatisticsCard from './StatisticsCard';

const StatisticsSection: React.FC = () => {
  const statistics = [
    {
      title: "Total Value Locked",
      value: "$1,245,300",
      description: "Across all pools"
    },
    {
      title: "Your Portfolio Value", 
      value: "$12,450",
      description: "+3.2% from last week"
    },
    {
      title: "Available Liquidity",
      value: "$450,000", 
      description: "Ready for borrowing"
    }
  ];

  return (
    <div className="relative py-12 bg-black text-white overflow-hidden">
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
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8 font-vt323 tracking-tight" 
            style={{ fontFamily: 'var(--font-vt323), monospace' }}>
          DASHBOARD OVERVIEW
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statistics.map((stat, index) => (
            <StatisticsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;