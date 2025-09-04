import React from 'react';
import { BaseComponentProps } from '../../types';

export interface CallToActionProps extends BaseComponentProps {
  title: string;
  description?: string;
  primaryButton?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryButton?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  theme?: 'light' | 'dark';
  variant?: 'default' | 'gradient' | 'minimal';
  backgroundImage?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  className = '',
  children,
  theme = 'dark',
  variant = 'default',
  backgroundImage
}) => {
  const isDark = theme === 'dark';
  
  const getWrapperClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white';
      case 'minimal':
        return isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
      default:
        return isDark 
          ? 'bg-gray-800 text-white' 
          : 'bg-white text-gray-900 border border-gray-200';
    }
  };

  const titleClasses = variant === 'minimal' 
    ? (isDark ? 'text-white' : 'text-gray-900')
    : 'text-white';

  const descriptionClasses = variant === 'minimal'
    ? (isDark ? 'text-gray-300' : 'text-gray-600')
    : 'text-white/90';

  const primaryButtonClasses = variant === 'gradient'
    ? 'bg-white text-indigo-600 hover:bg-gray-100'
    : isDark
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  const secondaryButtonClasses = variant === 'gradient'
    ? 'border border-white text-white hover:bg-white hover:text-indigo-600'
    : isDark
    ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
    : 'border border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <section 
      className={`py-16 ${getWrapperClasses()} ${className}`}
      style={backgroundImage ? { 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${titleClasses}`}>
          {title}
        </h2>
        
        {description && (
          <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${descriptionClasses}`}>
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {primaryButton && (
            <a
              href={primaryButton.href}
              onClick={primaryButton.onClick}
              className={`inline-block px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${primaryButtonClasses}`}
            >
              {primaryButton.text}
            </a>
          )}
          
          {secondaryButton && (
            <a
              href={secondaryButton.href}
              onClick={secondaryButton.onClick}
              className={`inline-block px-8 py-3 rounded-lg font-medium transition-all duration-200 ${secondaryButtonClasses}`}
            >
              {secondaryButton.text}
            </a>
          )}
        </div>

        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default CallToAction;