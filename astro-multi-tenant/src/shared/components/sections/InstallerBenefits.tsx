import React, { useState, useEffect, useRef } from 'react';
import { ScrollAnimation, useScrollAnimation } from '../../../shared/components/utils/ScrollAnimation';

interface Benefit {
  text: string;
  icon?: string;
}

interface InstallerBenefitsProps {
  data: {
    title: string;
    subtitle?: string;
    benefits: Benefit[];
    cta?: {
      text: string;
      link: string;
      secondary?: {
        text: string;
        link: string;
      };
    };
  };
}

const InstallerBenefits: React.FC<InstallerBenefitsProps> = ({ data }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  return (
    <section className="py-16 bg-gradient-to-r from-background to-surface text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <ScrollAnimation animation="slide-in-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-text-secondary mb-8">
                {data.subtitle}
              </p>
            )}

            {/* Benefits list with animated checkmarks */}
            <ul ref={ref as any} className="space-y-4 mb-8">
              {data.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center
                    transition-all duration-500 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }
                  `}
                  style={{
                    transitionDelay: isVisible ? `${index * 100 + 200}ms` : '0ms'
                  }}>
                    <svg 
                      className="w-4 h-4 text-text-inverse" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <span className="text-lg">
                    {benefit.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            {data.cta && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={data.cta.link}
                  className="inline-block px-6 py-3 bg-primary text-text-inverse rounded-lg font-semibold hover:bg-link-hover transition-colors text-center"
                >
                  {data.cta.text}
                </a>
                {data.cta.secondary && (
                  <a
                    href={data.cta.secondary.link}
                    className="inline-block px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-text-inverse transition-all text-center"
                  >
                    {data.cta.secondary.text}
                  </a>
                )}
              </div>
            )}
          </ScrollAnimation>

          {/* Visual element */}
          <ScrollAnimation animation="slide-in-right" className="relative">
            <div className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl">
              <div className="bg-background rounded-2xl p-8">
                {/* Installation time comparison */}
                <div className="space-y-6">
                  <div
                    onMouseEnter={() => setHoveredBar('traditional')}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <p className="text-text-muted text-sm mb-2">Traditional Systems</p>
                    <div className="bg-surface rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">45+ minutes</span>
                        <span className="text-error text-sm">❌ Complex</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-error h-2 rounded-full transition-all duration-500 ease-out" 
                          style={{ 
                            width: hoveredBar === 'traditional' ? '0%' : (hasAnimated ? '90%' : '0%'),
                            transitionDelay: hasAnimated && hoveredBar !== 'traditional' ? '300ms' : '0ms'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    onMouseEnter={() => setHoveredBar('dockhub')}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <p className="text-text-muted text-sm mb-2">DockHub Uno</p>
                    <div className="bg-surface rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">10 minutes</span>
                        <span className="text-success text-sm">✓ Simple</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500 ease-out" 
                          style={{ 
                            width: hoveredBar === 'dockhub' ? '0%' : (hasAnimated ? '20%' : '0%'),
                            transitionDelay: hasAnimated && hoveredBar !== 'dockhub' ? '500ms' : '0ms'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">75%</div>
                      <div className="text-sm text-text-muted">Less Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">90%</div>
                      <div className="text-sm text-text-muted">Fewer Callbacks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

export default InstallerBenefits;