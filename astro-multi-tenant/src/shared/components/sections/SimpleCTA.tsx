import React from 'react';
import { ScrollAnimation } from '../../../shared/components/utils/ScrollAnimation';

interface DockHubCTAProps {
  data: {
    title: string;
    subtitle?: string;
    price?: string;
    priceLabel?: string;
    primaryButton?: {
      text: string;
      link: string;
    };
    features?: string[];
  };
}

const DockHubCTA: React.FC<DockHubCTAProps> = ({ data }) => {
  return (
    <section className="py-16 bg-gradient-to-r from-background to-surface text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <ScrollAnimation animation="fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {data.title}
          </h2>
          
          {data.subtitle && (
            <p className="text-xl mb-8 text-text-secondary">
              {data.subtitle}
            </p>
          )}

          {data.price && (
            <div className="mb-8">
              <div className="text-6xl font-bold text-primary mb-2">
                {data.price}
              </div>
              {data.priceLabel && (
                <p className="text-text-secondary">
                  {data.priceLabel}
                </p>
              )}
            </div>
          )}

          {data.primaryButton && (
            <a
              href={data.primaryButton.link}
              className="inline-block px-8 py-4 bg-primary text-text-inverse rounded-lg font-semibold text-lg hover:bg-link-hover transform hover:-translate-y-0.5 transition-all shadow-xl"
            >
              {data.primaryButton.text}
            </a>
          )}

          {data.features && data.features.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
              {data.features.map((feature, index) => (
                <ScrollAnimation
                  key={index}
                  animation="fade-in"
                  delay={index * 100}
                  className="flex items-center"
                >
                  <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </ScrollAnimation>
              ))}
            </div>
          )}
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default DockHubCTA;