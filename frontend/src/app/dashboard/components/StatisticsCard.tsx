import React from 'react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default StatisticsCard;