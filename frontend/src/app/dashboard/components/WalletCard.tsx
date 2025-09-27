import React from 'react';

interface WalletCardProps {
  title: string;
  description: string;
  href: string;
  logo: React.ReactNode;
}

const WalletCard: React.FC<WalletCardProps> = ({ 
  title, 
  description, 
  href,
  logo
}) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative bg-gray-800 rounded-none border border-gray-700 hover:border-gray-600 
               transition-all duration-300 p-8 flex flex-col justify-between min-h-[200px] overflow-hidden"
  >
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-6">
        <div className="text-white">
          {logo}
        </div>
        
        {/* Arrow icon */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform 
                        translate-x-2 group-hover:translate-x-0">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
      
      <div>
        <h3 className="text-white text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors font-vt323">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors font-inter">
          {description}
        </p>
      </div>
    </div>
  </a>
);

export default WalletCard;