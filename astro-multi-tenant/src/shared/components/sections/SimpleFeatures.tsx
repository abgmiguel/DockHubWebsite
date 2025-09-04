import React from 'react';
import { ScrollAnimation } from '../../../shared/components/utils/ScrollAnimation';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface DockHubFeaturesProps {
  data: {
    title: string;
    subtitle?: string;
    features: Feature[];
  };
}

const DockHubFeatures: React.FC<DockHubFeaturesProps> = ({ data }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollAnimation animation="fade-in-up" className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-background">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-gray-600">
              {data.subtitle}
            </p>
          )}
        </ScrollAnimation>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features.map((feature, index) => (
            <ScrollAnimation
              key={index}
              animation="fade-in-up"
              delay={index * 100}
              className="group"
            >
              <div className="flex gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md bg-gradient-to-br from-background to-surface group-hover:scale-110 transition-transform">
                  <span className="filter brightness-200">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-lg text-background">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DockHubFeatures;