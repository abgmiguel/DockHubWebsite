import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  cardId: string | null;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

interface CardDragContextType {
  cardPositions: Record<string, Position>;
  dragState: DragState;
  startDrag: (e: React.MouseEvent, cardId: string) => void;
  updatePosition: (cardId: string, position: Position) => void;
  isDragging: (cardId: string) => boolean;
}

const CardDragContext = createContext<CardDragContextType | undefined>(undefined);

export const useCardDrag = () => {
  const context = useContext(CardDragContext);
  if (!context) {
    throw new Error('useCardDrag must be used within a CardDragProvider');
  }
  return context;
};

interface CardDragProviderProps {
  children: ReactNode;
}

export const CardDragProvider: React.FC<CardDragProviderProps> = ({ children }) => {
  const [cardPositions, setCardPositions] = useState<Record<string, Position>>({});
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    cardId: null,
    initialX: 0,
    initialY: 0,
    offsetX: 0,
    offsetY: 0
  });

  const startDrag = (e: React.MouseEvent, cardId: string) => {
    e.preventDefault();
    
    setDragState({
      isDragging: true,
      cardId: cardId,
      initialX: e.clientX,
      initialY: e.clientY,
      offsetX: cardPositions[cardId]?.x || 0,
      offsetY: cardPositions[cardId]?.y || 0
    });
  };

  const updatePosition = (cardId: string, position: Position) => {
    setCardPositions(prev => ({
      ...prev,
      [cardId]: position
    }));
  };

  const isDragging = (cardId: string) => {
    return dragState.isDragging && dragState.cardId === cardId;
  };

  // Global mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.cardId) return;

      const deltaX = e.clientX - dragState.initialX;
      const deltaY = e.clientY - dragState.initialY;

      setCardPositions(prev => ({
        ...prev,
        [dragState.cardId!]: {
          x: dragState.offsetX + deltaX,
          y: dragState.offsetY + deltaY
        }
      }));
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState(prev => ({
          ...prev,
          isDragging: false
        }));
      }
    };

    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  return (
    <CardDragContext.Provider value={{
      cardPositions,
      dragState,
      startDrag,
      updatePosition,
      isDragging
    }}>
      {children}
    </CardDragContext.Provider>
  );
};

export default CardDragContext;