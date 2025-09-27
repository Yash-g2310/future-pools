import React from 'react';

const MarketOverview = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lending Market Overview</h2>
      <p className="mb-2">Here you can find the latest information about the lending market.</p>
      {/* Add more details about the lending market here */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold">Current Lending Rates</h3>
        <ul className="list-disc pl-5">
          <li>Rate 1: 5%</li>
          <li>Rate 2: 4.5%</li>
          <li>Rate 3: 6%</li>
        </ul>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg shadow mt-4">
        <h3 className="text-xl font-semibold">Top Lending Platforms</h3>
        <ul className="list-disc pl-5">
          <li>Platform A</li>
          <li>Platform B</li>
          <li>Platform C</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketOverview;