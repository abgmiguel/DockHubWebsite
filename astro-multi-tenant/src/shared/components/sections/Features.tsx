import React, { useState, useEffect, useRef } from 'react';
import { BaseComponentProps, FeatureData } from '../../types';

export interface FeaturesProps extends BaseComponentProps {
  features: FeatureData[];
  title?: string;
  description?: string;
  theme?: 'light' | 'dark';
  columns?: 1 | 2 | 3 | 4;
  showAnimation?: boolean;
  onFeatureClick?: (feature: FeatureData) => void;
}

const Features: React.FC<FeaturesProps> = ({
  features,
  title,
  description,
  className = '',
  theme = 'dark',
  columns = 3,
  showAnimation = true,
  onFeatureClick
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false));
  const gridRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const titleClasses = isDark ? 'text-white' : 'text-gray-900';
  const descriptionClasses = isDark ? 'text-gray-300' : 'text-gray-600';

  const gridClasses = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  useEffect(() => {
    if (!showAnimation) {
      setVisibleCards(new Array(features.length).fill(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Animate cards in sequence
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 80); // Stagger by 80ms per card
          });
          
          // Unobserve after animation starts
          if (gridRef.current) {
            observer.unobserve(gridRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, [features.length, showAnimation]);

  const renderPattern = (pattern: string, id: string) => {
    const patternId = `${pattern}-${id}`;
    switch (pattern) {
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'diagonal':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,40 L40,0" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className={className}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${titleClasses}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`text-lg max-w-3xl mx-auto ${descriptionClasses}`}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div className="w-full" ref={gridRef}>
        <div className={`grid ${gridClasses[columns]} gap-4 auto-rows-[200px]`}>
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`relative group overflow-hidden rounded-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onFeatureClick?.(feature)}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-95 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Pattern Overlay */}
              {renderPattern('dots', feature.id)}
              
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700 scale-150" />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative z-10 p-5 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  {feature.icon && (
                    <div className="text-white/90 flex-shrink-0">
                      {typeof feature.icon === 'string' ? (
                        <img src={feature.icon} alt="" className="w-8 h-8" />
                      ) : (
                        <div className="w-8 h-8">{feature.icon}</div>
                      )}
                    </div>
                  )}
                  <h3 className="text-white font-bold text-base leading-tight">{feature.title}</h3>
                </div>
                
                <div className="text-white/70 text-xs space-y-1 flex-grow">
                  <p className="leading-tight">{feature.description}</p>
                </div>
              </div>
              
              {/* Feature Image */}
              {feature.image && (
                <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-20">
                  <img 
                    src={feature.image} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Corner Decoration */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Mobile Grid - Single Column */}
        <div className="sm:hidden grid grid-cols-1 gap-4">
          {features.map((feature, index) => (
            <div
              key={`mobile-${feature.id}`}
              className={`relative group overflow-hidden rounded-xl transition-all duration-700 hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onFeatureClick?.(feature)}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-95" />
              
              {/* Pattern Overlay */}
              {renderPattern('dots', `mobile-${feature.id}`)}
              
              {/* Border */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
              
              {/* Content */}
              <div className="relative z-10 p-5">
                <div className="flex items-start gap-3 mb-3">
                  {feature.icon && (
                    <div className="text-white/90 flex-shrink-0">
                      {typeof feature.icon === 'string' ? (
                        <img src={feature.icon} alt="" className="w-8 h-8" />
                      ) : (
                        <div className="w-8 h-8">{feature.icon}</div>
                      )}
                    </div>
                  )}
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                </div>
                
                <div className="text-white/70 text-sm space-y-1">
                  <p>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;