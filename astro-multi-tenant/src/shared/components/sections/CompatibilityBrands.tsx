import React, { useState } from 'react';
import { ScrollAnimation, StaggeredAnimation } from '../../../shared/components/utils/ScrollAnimation';

interface Brand {
  name: string;
  compatible: boolean;
  logo?: string;
}

interface CompatibilityBrandsProps {
  data: {
    title: string;
    subtitle?: string;
    percentage: string;
    brands: Brand[];
    inputPlaceholder?: string;
    checkButtonText?: string;
  };
}

const CompatibilityBrands: React.FC<CompatibilityBrandsProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (searchTerm.trim()) {
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
    }
  };

  const filteredBrands = data.brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-16 bg-surface text-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollAnimation animation="fade-in-up" className="text-center mb-12">
          <div className="inline-block px-6 py-3 bg-primary text-text-inverse rounded-full text-6xl font-bold mb-4">
            {data.percentage}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-text-secondary">
              {data.subtitle}
            </p>
          )}
        </ScrollAnimation>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {data.brands.map((brand, index) => (
            <ScrollAnimation
              key={index}
              animation="scale-in"
              delay={index * 50}
              className="group"
            >
              <div className={`
                bg-background rounded-lg p-6 text-center transition-all duration-300
                hover:scale-105 hover:shadow-xl border-2
                ${brand.compatible 
                  ? 'border-primary hover:border-link-hover' 
                  : 'border-gray-600 opacity-75'}
              `}>
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-12 mx-auto mb-2 filter brightness-0 invert"
                  />
                ) : (
                  <div className="h-12 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-text-secondary">
                      {brand.name.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium">
                  {brand.name}
                </p>
                {brand.compatible && (
                  <div className="mt-2 text-primary text-xs">✓ Compatible</div>
                )}
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Compatibility Checker */}
        <ScrollAnimation animation="fade-in-up">
          <div className="bg-background rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Check Your Lift Compatibility
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={data.inputPlaceholder || "Enter your lift brand and model..."}
                className="flex-1 px-4 py-3 rounded-lg bg-surface border border-border text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
              />
              <button
                onClick={handleCheck}
                className="px-6 py-3 bg-primary text-text-inverse rounded-lg font-semibold hover:bg-link-hover transition-colors"
              >
                {data.checkButtonText || "Check"}
              </button>
            </div>
            
            {/* Result message */}
            {showResult && (
              <div className="mt-4 p-4 bg-success bg-opacity-20 border border-success rounded-lg animate-fade-in">
                <p className="text-success font-medium">
                  ✓ Great news! DockHub is compatible with your lift system.
                </p>
              </div>
            )}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default CompatibilityBrands;