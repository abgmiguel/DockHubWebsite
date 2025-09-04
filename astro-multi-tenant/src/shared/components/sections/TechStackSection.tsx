import React, { useRef } from 'react';
import TechSection from '../Tech/TechSection';

const TechStackSection: React.FC = () => {
  const techSectionRef = useRef<HTMLDivElement>(null);
  
  return <TechSection techSectionRef={techSectionRef} />;
};

export default TechStackSection;