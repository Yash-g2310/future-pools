import React from 'react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-500 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default StatisticsCard;