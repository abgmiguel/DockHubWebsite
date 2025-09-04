import React from 'react';
import QuotedHero from '../Hero/QuotedHero';

interface FeaturesHeroProps {
  data: {
    title?: string;
    subtitle?: string;
    quote?: {
      text: string;
      authorName: string;
      authorTitle: string;
    };
  };
}

const FeaturesHero: React.FC<FeaturesHeroProps> = ({ data }) => {
  return (
    <QuotedHero 
      title={data.title || ""}
      subtitle={data.subtitle || ""}
      quote={data.quote}
    />
  );
};

export default FeaturesHero;