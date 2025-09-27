import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  iconSvg: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  href,
  iconSvg
}) => (
  <div className="group relative bg-[#2a2a2a] hover:scale-105 border border-gray-700 hover:border-blue-500/50 
                  transition-all duration-300 p-6 overflow-hidden">
    {/* Hover gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 text-blue-400 transition-colors">
          {iconSvg}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform 
                        translate-x-2 group-hover:translate-x-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-5xl font-semibold text-white mb-3 transition-colors font-vt323">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed transition-colors font-inter">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default FeatureCard;