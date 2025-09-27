import React from 'react';

interface SectionHeaderProps {
  number?: string;
  title: string;
  description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  number, 
  title, 
  description 
}) => (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight font-vt323" 
              style={{ fontFamily: 'var(--font-vt323), monospace' }}>
            {number ? `${number}. ${title}` : title}
          </h2>
        </div>
        
        <div className="max-w-lg">
          <p className="text-xl text-gray-300 leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default SectionHeader;