import React, { useState, useEffect } from 'react';
import DraggableCardWrapper from '../Cards/DraggableCardWrapper';

interface TechSectionSimplifiedProps {
  techSectionRef: React.RefObject<HTMLDivElement | null>;
}

const TechSectionSimplified: React.FC<TechSectionSimplifiedProps> = ({ techSectionRef }) => {
  const [cardsVisible, setCardsVisible] = useState<boolean[]>([false, false, false]);

  // Set up Intersection Observer for animated cards
  useEffect(() => {
    setCardsVisible([false, false, false]);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setCardsVisible([true, false, false]), 0);
        setTimeout(() => setCardsVisible([true, true, false]), 300);
        setTimeout(() => setCardsVisible([true, true, true]), 600);

        if (techSectionRef.current) {
          observer.unobserve(techSectionRef.current);
        }
      }
    }, observerOptions);

    const techSection = techSectionRef.current;
    if (techSection) {
      observer.observe(techSection);
    }

    return () => {
      if (techSection) observer.unobserve(techSection);
    };
  }, [techSectionRef]);

  const cards = [
    {
      title: "Drag & Drop",
      icon: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
      content: "Cards can be dragged and repositioned, allowing for a customizable and interactive user experience."
    },
    {
      title: "Scroll Animation",
      icon: <path d="M19 9l-7 7-7-7" />,
      content: "Cards animate and stack as you scroll, creating a visually engaging experience that guides users through content."
    },
    {
      title: "Responsive Design",
      icon: <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
      content: "Cards adapt to any screen size, ensuring a consistent experience across desktop and mobile devices."
    }
  ];

  return (
    <div className="bg-white py-24" ref={techSectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Interactive Card Technology</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our innovative card stacking system provides an intuitive and engaging way to present information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {cards.map((card, index) => (
            <DraggableCardWrapper
              key={index}
              title={card.title}
              isVisible={cardsVisible[index]}
              animationDelay={index * 0.2}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {card.icon}
                  </svg>
                </div>
                <h4 className="text-xl font-semibold">{card.title}</h4>
              </div>
              <p className="text-gray-600">{card.content}</p>
            </DraggableCardWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechSectionSimplified;