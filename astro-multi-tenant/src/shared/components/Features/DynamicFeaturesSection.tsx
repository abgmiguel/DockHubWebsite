import React, { useState, useEffect } from 'react';
import featureCardsData from '../../data/feature-cards.json';

interface DynamicFeaturesSectionProps {
  featureSectionRef: React.RefObject<HTMLDivElement | null>;
  cardPositions: Record<number, { x: number; y: number }>;
  dragState: {
    isDragging: boolean;
    cardId: number | null;
    cardType?: 'stack' | 'tech' | 'feature' | 'testimonial' | null;
  };
  handleMouseDown: (e: React.MouseEvent, cardId: number, cardType: 'stack' | 'tech' | 'feature' | 'testimonial', cardIndex?: number) => void;
}

const DynamicFeaturesSection: React.FC<DynamicFeaturesSectionProps> = ({
  featureSectionRef,
  cardPositions,
  dragState,
  handleMouseDown
}) => {
  const [featureCardsVisible, setFeatureCardsVisible] = useState<boolean[]>(
    new Array(featureCardsData.cards.length).fill(false)
  );
  const { title, cards, animation } = featureCardsData;

  // Set up Intersection Observer for animated cards
  useEffect(() => {
    // Initially hide all cards
    setFeatureCardsVisible(new Array(cards.length).fill(false));

    // Create observer for the feature cards section
    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: animation.observerThreshold || 0.2, // Use configurable threshold
    };

    // Observer for feature cards
    const featureObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Stagger the appearance of each card
        cards.forEach((_, index) => {
          setTimeout(() => {
            setFeatureCardsVisible(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }, index * (animation.staggerDelay || 300));
        });

        // Unobserve after animation is triggered
        if (featureSectionRef.current) {
          featureObserver.unobserve(featureSectionRef.current);
        }
      }
    }, observerOptions);

    // Store ref in variable to use in cleanup
    const featureSection = featureSectionRef.current;

    // Start observing
    if (featureSection) {
      featureObserver.observe(featureSection);
    }

    // Clean up
    return () => {
      if (featureSection) featureObserver.unobserve(featureSection);
    };
  }, [featureSectionRef, cards, animation]);

  // Helper function to get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      Zap: (
        <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      Shield: (
        <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      Layers: (
        <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.Zap;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4" ref={featureSectionRef}>
      <h2 className="text-3xl font-bold mb-12 text-center text-foreground">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card bg-surface rounded-lg shadow-xl transition-all duration-700 transform overflow-hidden ${
              featureCardsVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
            style={{
              ...cardPositions[2000 + index] && {
                transform: `translate(${cardPositions[2000 + index].x}px, ${cardPositions[2000 + index].y}px)`,
                position: 'relative',
                zIndex: dragState.cardId === 2000 + index ? 999 : 1,
                transition: dragState.isDragging && dragState.cardId === 2000 + index ? 'none' : 'all 0.7s ease-out'
              }
            }}
          >
            {/* Mac-style title bar */}
            <div 
              className="bg-gradient-to-b from-surface-light to-surface px-4 py-2 flex items-center border-b border-border" 
              style={{ cursor: 'grab', userSelect: 'none' }}
              onMouseDown={(e) => handleMouseDown(e, 2000 + index, 'feature', index)}
            >
              {/* Mac window buttons */}
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 bg-error rounded-full border border-error-dark"></div>
                <div className="w-3 h-3 bg-warning rounded-full border border-warning-dark"></div>
                <div className="w-3 h-3 bg-success rounded-full border border-success-dark"></div>
              </div>
              <h3 className="text-sm font-medium text-foreground-secondary flex-1 text-center">{card.title}</h3>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
            {/* Card content */}
            <div className="p-6 bg-background-secondary">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center mr-3`}>
                  {getIcon(card.icon)}
                </div>
                <h4 className="text-xl font-semibold text-foreground">{card.title}</h4>
              </div>
              <p className="text-foreground-muted">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFeaturesSection;