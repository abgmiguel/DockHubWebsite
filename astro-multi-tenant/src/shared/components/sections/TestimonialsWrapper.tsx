import React, { useState } from 'react';
import TestimonialsSection from '../Testimonials/TestimonialsSection';

const TestimonialsWrapper: React.FC = () => {
  const [cardPositions, setCardPositions] = useState<Record<number, { x: number, y: number }>>({});
  const [dragState, setDragState] = useState({
    isDragging: false,
    cardId: null as number | null,
    cardType: null as 'stack' | 'tech' | 'feature' | 'testimonial' | null
  });

  const handleMouseDown = (e: React.MouseEvent, cardId: number, cardType: 'stack' | 'tech' | 'feature' | 'testimonial', cardIndex?: number) => {
    // Simple implementation for now
    console.log('Mouse down on testimonial card');
  };

  return (
    <TestimonialsSection 
      cardPositions={cardPositions}
      dragState={dragState}
      handleMouseDown={handleMouseDown}
    />
  );
};

export default TestimonialsWrapper;