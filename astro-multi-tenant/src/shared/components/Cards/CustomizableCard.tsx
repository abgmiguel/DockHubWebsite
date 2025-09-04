import React from 'react';

interface CustomizableCardProps {
  width?: string | number;
  height?: string | number;
  title: string;
  content: React.ReactNode;
  className?: string;
  draggable?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const CustomizableCard: React.FC<CustomizableCardProps> = ({
  width = '100%',
  height = 'auto',
  title,
  content,
  className = '',
  draggable = false,
  onMouseDown,
  style = {}
}) => {
  return (
    <div 
      className={`card bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.1)] ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
    >
      {/* Mac-style title bar - dark mode */}
      <div 
        className="bg-gradient-to-b from-gray-700/90 to-gray-800/90 backdrop-blur-sm px-4 py-2.5 flex items-center border-b border-gray-600/50" 
        style={{ 
          cursor: draggable ? 'grab' : 'default', 
          userSelect: 'none' 
        }}
        onMouseDown={draggable ? onMouseDown : undefined}
      >
        {/* Mac window buttons */}
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 bg-red-500/80 rounded-full border border-red-600/50 hover:bg-red-500 transition-colors duration-200"></div>
          <div className="w-3 h-3 bg-yellow-500/80 rounded-full border border-yellow-600/50 hover:bg-yellow-500 transition-colors duration-200"></div>
          <div className="w-3 h-3 bg-green-500/80 rounded-full border border-green-600/50 hover:bg-green-500 transition-colors duration-200"></div>
        </div>
        <h3 className="text-sm font-medium text-gray-200 flex-1 text-center tracking-wide">{title}</h3>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>
      
      {/* Card content */}
      <div className="p-6 bg-gradient-to-b from-gray-900/95 to-gray-900/98" style={{ height: 'calc(100% - 44px)' }}>
        {content}
      </div>
    </div>
  );
};

export default CustomizableCard;