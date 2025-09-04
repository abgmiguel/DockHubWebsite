import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icons/Icons';
import featuresGridData from '../../data/features-grid.json';

const DynamicFeatureGrid = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(featuresGridData.features.length).fill(false));
  const gridRef = useRef<HTMLDivElement>(null);
  
  const { title, subtitle, features, gridConfig } = featuresGridData;

  useEffect(() => {
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
      { threshold: 0.1 } // Trigger when 10% of the grid is visible
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, [features]);

  const renderPattern = (pattern: string, id: number) => {
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
      case 'waves':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q 25 0 50 10 T 100 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="3" fill="currentColor" />
                <path d="M30,0 L30,27 M30,33 L30,60 M0,30 L27,30 M33,30 L60,30" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine the grid class for each card based on its size
  const getCardSizeClass = (size: string, isMobile: boolean = false) => {
    if (isMobile) return 'col-span-1'; // All cards span 1 column on mobile
    
    switch (size) {
      case 'large':
        return 'col-span-2 row-span-2';
      case 'wide':
        return 'col-span-2 row-span-1';
      case 'tall':
        return 'col-span-1 row-span-2';
      case 'medium':
      default:
        return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className="w-full px-4 py-16" ref={gridRef}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-foreground-muted text-lg max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Desktop Grid - Dynamic columns from config */}
        <div className={`hidden sm:grid sm:grid-cols-${gridConfig.tablet.columns} lg:grid-cols-${gridConfig.tablet.columns} xl:grid-cols-${gridConfig.desktop.columns} gap-4 auto-rows-[${gridConfig.desktop.rowHeight}]`}>
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${getCardSizeClass(feature.size)} relative group overflow-hidden rounded-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                if (feature.learnMoreLink) {
                  window.location.href = feature.learnMoreLink;
                }
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Pattern Overlay */}
              {renderPattern(feature.pattern, feature.id)}
              
              {/* Animated Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700 scale-150`} />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                   style={{padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}} />
              
              {/* Content */}
              <div className="relative z-10 p-5 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-white/90 flex-shrink-0">
                    <Icon name={feature.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight">{feature.title}</h3>
                </div>
                
                <ul className="text-white/70 text-xs space-y-1 flex-grow">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-white/40 mr-2 mt-0.5">•</span>
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Feature Image (if applicable) */}
              {feature.hasImage && feature.imageSrc && (
                <div className="absolute bottom-0 right-0 w-80 h-96 pointer-events-none">
                  <img 
                    src={feature.imageSrc} 
                    alt={`${feature.title} Preview`} 
                    className="absolute bottom-0 right-0 w-full h-full object-contain object-bottom-right transform translate-x-16 translate-y-24 group-hover:translate-y-16 transition-transform duration-500"
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
              key={feature.id}
              className={`relative group overflow-hidden rounded-xl transition-all duration-700 hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                if (feature.learnMoreLink) {
                  window.location.href = feature.learnMoreLink;
                }
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-95`} />
              
              {/* Pattern Overlay */}
              {renderPattern(feature.pattern, feature.id)}
              
              {/* Border */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
              
              {/* Content */}
              <div className="relative z-10 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-white/90 flex-shrink-0">
                    <Icon name={feature.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                </div>
                
                <ul className="text-white/70 text-sm space-y-1">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-white/40 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicFeatureGrid;