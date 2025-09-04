import React, { useId } from 'react';
import DraggableCard from './DraggableCard';
import { useCardDrag } from '../contexts/CardDragContext';

interface DraggableCardWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  initialStyle?: React.CSSProperties;
  animate?: boolean;
  animationDelay?: number;
  isVisible?: boolean;
}

const DraggableCardWrapper: React.FC<DraggableCardWrapperProps> = ({
  title,
  children,
  className = '',
  initialStyle = {},
  animate = true,
  animationDelay = 0,
  isVisible = true
}) => {
  // Generate a unique ID for this card instance
  const cardId = useId();
  const { cardPositions, startDrag, isDragging } = useCardDrag();
  
  const position = cardPositions[cardId] || { x: 0, y: 0 };
  const isCardDragging = isDragging(cardId);

  // Build the animation classes
  const animationClasses = animate 
    ? `transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`
    : '';

  // Build the style object
  const style: React.CSSProperties = {
    ...initialStyle,
    ...(position.x !== 0 || position.y !== 0 ? {
      transform: `translate(${position.x}px, ${position.y}px)`,
      position: 'relative',
      zIndex: isCardDragging ? 999 : initialStyle.zIndex || 1,
    } : {}),
    transition: isCardDragging ? 'none' : 'all 0.7s ease-out',
    transitionDelay: animate && !isCardDragging ? `${animationDelay}s` : '0s'
  };

  return (
    <DraggableCard
      title={title}
      className={`${animationClasses} ${className}`}
      style={style}
      onDragStart={(e) => startDrag(e, cardId)}
      isDragging={isCardDragging}
      cardId={cardId}
    >
      {children}
    </DraggableCard>
  );
};

export default DraggableCardWrapper;