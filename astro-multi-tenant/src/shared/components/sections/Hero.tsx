import React from 'react';
import { BaseComponentProps, HeroData } from '../../types';

export interface HeroProps extends BaseComponentProps {
  data: HeroData;
  theme?: 'light' | 'dark';
  showScrollIndicator?: boolean;
  backgroundImage?: string;
  variant?: 'default' | 'centered' | 'split';
}

const Hero: React.FC<HeroProps> = ({
  data,
  className = '',
  children,
  theme = 'dark',
  showScrollIndicator = true,
  backgroundImage,
  variant = 'default'
}) => {
  const isDark = theme === 'dark';
  
  const wrapperClasses = isDark
    ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
    : 'bg-gradient-to-b from-gray-50 to-white text-gray-900';

  const subtitleClasses = isDark ? 'text-gray-300' : 'text-gray-600';
  const descriptionClasses = isDark ? 'text-gray-400' : 'text-gray-500';

  const ctaClasses = isDark
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  const renderContent = () => {
    switch (variant) {
      case 'centered':
        return (
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-2">
              {data.title.includes('Powerful.') ? (
                <>
                  {data.title.split('Powerful.')[0]} <span className="text-indigo-400">Powerful.</span>
                  {data.title.split('Powerful.')[1]}
                </>
              ) : (
                data.title
              )}
            </h1>
            {data.subtitle && (
              <h2 className={`text-2xl md:text-3xl lg:text-4xl font-medium mb-6 ${subtitleClasses}`}>
                {data.subtitle}
              </h2>
            )}
            <p className={`text-lg md:text-xl lg:text-2xl mb-4 ${subtitleClasses}`}>
              {data.description}
            </p>
            {data.ctaText && data.ctaLink && (
              <div className="mt-8">
                <a
                  href={data.ctaLink}
                  className={`inline-block px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${ctaClasses}`}
                >
                  {data.ctaText}
                </a>
              </div>
            )}
            {showScrollIndicator && (
              <div className="mt-12 animate-bounce">
                <svg className="w-8 h-8 mx-auto text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            )}
          </div>
        );
      
      case 'split':
        return (
          <div className="flex flex-col lg:flex-row w-full items-center justify-center">
            <div className="flex-1 flex items-center justify-center"></div>
            <div className="lg:w-[450px] flex flex-col items-center justify-center px-4 lg:px-0 pb-5 lg:pb-0">
              <div className="text-center font-bold mb-8 tracking-tight">
                <h1 className="text-3xl lg:text-4xl">{data.title}</h1>
              </div>
              <div className={`text-center opacity-70 ${descriptionClasses}`}>
                <p className="text-base lg:text-lg">{data.description}</p>
              </div>
            </div>
            {data.image && (
              <div className="lg:w-[450px] flex items-center justify-center">
                <img src={data.image} alt="Hero" className="w-full h-auto max-w-[450px]" />
              </div>
            )}
            <div className="flex-1 flex items-center justify-center"></div>
          </div>
        );

      default:
        return (
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {data.title}
              </h1>
              {data.subtitle && (
                <h2 className={`text-xl md:text-2xl mb-6 ${subtitleClasses}`}>
                  {data.subtitle}
                </h2>
              )}
              <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${descriptionClasses}`}>
                {data.description}
              </p>
              {data.ctaText && data.ctaLink && (
                <a
                  href={data.ctaLink}
                  className={`inline-block px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${ctaClasses}`}
                >
                  {data.ctaText}
                </a>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`h-screen flex items-center justify-center pt-16 ${wrapperClasses} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {renderContent()}
      {children}
    </div>
  );
};

export default Hero;