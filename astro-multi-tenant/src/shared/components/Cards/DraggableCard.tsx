import React, { useRef } from 'react';

interface DraggableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  cardId: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  title,
  children,
  className = '',
  style = {},
  onDragStart,
  onDragEnd,
  isDragging = false,
  cardId
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for this card instance
  const uniqueId = useRef(`card-${cardId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div
      ref={cardRef}
      className={`card bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'auto',
        zIndex: isDragging ? 999 : style.zIndex || 'auto',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(0, 0, 0, 0.2)' 
          : style.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      data-card-id={uniqueId.current}
    >
      {/* Mac-style title bar */}
      <div 
        className="bg-gradient-to-b from-gray-300 to-gray-200 px-4 py-2 flex items-center border-b border-gray-300" 
        style={{ cursor: 'grab', userSelect: 'none' }}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
        {/* Mac window buttons */}
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
        </div>
        <h3 className="text-sm font-medium text-gray-700 flex-1 text-center">{title}</h3>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>
      
      {/* Card content */}
      <div className="p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default DraggableCard;