import React, { useState, useEffect } from 'react';

interface TechSectionProps {
  techSectionRef: React.RefObject<HTMLDivElement | null>;
}

const TechSection: React.FC<TechSectionProps> = ({
  techSectionRef
}) => {
  const [videoVisible, setVideoVisible] = useState<boolean>(false);

  // Set up Intersection Observer for video
  useEffect(() => {
    // Initially hide video
    setVideoVisible(false);

    // Create observer for the tech section
    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.2, // Trigger when 20% of the element is visible
    };

    // Observer for video
    const techObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVideoVisible(true);

        // Unobserve after animation is triggered
        if (techSectionRef.current) {
          techObserver.unobserve(techSectionRef.current);
        }
      }
    }, observerOptions);

    // Store ref in variable to use in cleanup
    const techSection = techSectionRef.current;

    // Start observing
    if (techSection) {
      techObserver.observe(techSection);
    }

    // Clean up
    return () => {
      if (techSection) techObserver.unobserve(techSection);
    };
  }, [techSectionRef]);

  return (
    <div className="bg-gray-900 py-24" ref={techSectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-100">Whddddy are we better?</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See our innovative features in action with this demonstration
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-4xl mx-auto">
          <div 
            className={`relative rounded-lg overflow-hidden shadow-2xl transition-all duration-700 transform ${
              videoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <video
              className="w-full h-auto"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ 
                aspectRatio: '16/9',
                objectFit: 'cover'
              }}
            >
              <source src="/videos/tab-video-dark.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechSection;