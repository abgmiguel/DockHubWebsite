import React, { useState, useRef, useEffect } from 'react';
import CustomizableCard from './CustomizableCard';

interface DraggableCustomizableCardProps {
  width?: string | number;
  height?: string | number;
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DraggableCustomizableCard: React.FC<DraggableCustomizableCardProps> = ({
  width,
  height,
  title,
  children,
  className = '',
  style = {}
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    dragStartPos.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTransform({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: isDragging ? 1000 : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        ...style
      }}
    >
      <CustomizableCard
        width={width}
        height={height}
        title={title}
        content={children}
        className={className}
        draggable={true}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default DraggableCustomizableCard;