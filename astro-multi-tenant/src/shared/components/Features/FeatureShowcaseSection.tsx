import React, { useEffect } from 'react';
import QuotedHero from '../Hero/QuotedHero';
import TitledFeature from './TitledFeature';

interface FeatureShowcaseSectionProps {
  data: any;
}

const FeatureShowcaseSection: React.FC<FeatureShowcaseSectionProps> = ({ data }) => {
  const featureShowcaseData = data;
  useEffect(() => {
    // Parallax effect for shapes (even though they're not visible, keeping for future use)
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const shapes = document.querySelectorAll('.shape');
      
      shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        (shape as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  return (
    <div className="feature-showcase-section">
      {/* Hero Section */}
      <QuotedHero 
        title={featureShowcaseData.hero.title}
        subtitle={featureShowcaseData.hero.subtitle}
        quote={featureShowcaseData.hero.quote}
      />
      
      {/* Feature Sections */}
      {featureShowcaseData.features.map((feature, index) => (
        <TitledFeature
          key={index}
          id={feature.id}
          title={feature.title}
          heading={feature.heading}
          paragraphs={feature.paragraphs}
          learnMoreLink={feature.learnMoreLink}
          layout={index % 2 === 0 ? 'left' : 'right'}
          sectionNumber={index}
        />
      ))}

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0e27;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          border-radius: 4px;
        }

        /* Floating shapes (invisible but available) */
        .shape {
          position: absolute;
          opacity: 0.05;
          animation: float 20s infinite ease-in-out;
          display: none; /* Hidden as requested */
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          top: 60%;
          right: 10%;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          border-radius: 50%;
          bottom: 20%;
          left: 15%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureShowcaseSection;