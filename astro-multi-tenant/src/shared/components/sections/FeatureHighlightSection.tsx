"use client";

import { useEffect, useState } from 'react';

interface FeatureItem {
  title: string;
  subtitle: string;
}

interface FeatureHighlightData {
  id?: string;
  title: string;
  description: string;
  features: FeatureItem[];
  image: string;
}

interface FeatureHighlightSectionProps {
  data: FeatureHighlightData;
  sectionId?: string;
  imageOnRight?: boolean;
  className?: string;
}

const FeatureHighlightSection: React.FC<FeatureHighlightSectionProps> = ({ 
  data, 
  sectionId, 
  imageOnRight = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementId = sectionId || data.id || 'feature-highlight';

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight - 100;
      setIsVisible(isInView);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementId]);

  return (
    <div id={elementId} className={`py-12 bg-transparent ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-4 flex flex-col lg:flex-row items-center">
        {/* Content section */}
        <div className={`w-full lg:w-1/2 space-y-8 px-4 lg:px-0 ${
          imageOnRight ? 'lg:pr-8' : 'lg:pl-8 lg:order-2'
        }`}>
          <h2 className={`text-4xl md:text-6xl font-bold text-foreground transform transition-all duration-1000 
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? '-translate-x-32' : 'translate-x-32'} opacity-0`}`}>
            {data.title}
          </h2>
          
          <p className={`text-foreground-secondary text-lg md:text-xl transform transition-all duration-1000 delay-200
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? '-translate-x-32' : 'translate-x-32'} opacity-0`}`}>
            {data.description}
          </p>

          <div className="space-y-6">
            {data.features.map((item, index) => (
              <div 
                key={item.title}
                className={`transform transition-all duration-1000`}
                style={{
                  transitionDelay: `${(index + 2) * 200}ms`,
                  transform: isVisible ? 'translateX(0)' : imageOnRight ? 'translateX(-2rem)' : 'translateX(2rem)',
                  opacity: isVisible ? 1 : 0
                }}
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {item.title}
                </div>
                <div className="text-foreground-muted">
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image section */}
        <div className={`w-full lg:w-1/2 mt-12 lg:mt-0 ${
          imageOnRight ? 'lg:order-2' : 'lg:order-1'
        }`}>
          <div className={`transform transition-all duration-1000 delay-500
            ${isVisible ? 'translate-x-0 opacity-100' : `${imageOnRight ? 'translate-x-32' : '-translate-x-32'} opacity-0`}`}>
            <img
              src={data.image}
              alt={`${data.title} illustration`}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlightSection;