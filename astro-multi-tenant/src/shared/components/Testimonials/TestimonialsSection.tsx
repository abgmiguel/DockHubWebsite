import React, { useState, useEffect } from 'react';

interface TestimonialsSectionProps {
  cardPositions: Record<number, { x: number; y: number }>;
  dragState: {
    isDragging: boolean;
    cardId: number | null;
    cardType?: 'stack' | 'tech' | 'feature' | 'testimonial' | null;
  };
  handleMouseDown: (e: React.MouseEvent, cardId: number, cardType: 'stack' | 'tech' | 'feature' | 'testimonial', cardIndex?: number) => void;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  cardPositions,
  dragState,
  handleMouseDown
}) => {
  const [testimonialsVisible, setTestimonialsVisible] = useState<boolean[]>([false, false]);

  // Set up Intersection Observer for animated cards
  useEffect(() => {
    // Initially hide all cards
    setTestimonialsVisible([false, false]);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const testimonialObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Stagger the appearance of each card
        setTimeout(() => setTestimonialsVisible([true, false]), 0);
        setTimeout(() => setTestimonialsVisible([true, true]), 300);
      }
    }, observerOptions);

    // Get the testimonials container
    const testimonialsContainer = document.querySelector('.testimonials-container');
    
    if (testimonialsContainer) {
      testimonialObserver.observe(testimonialsContainer);
    }

    return () => {
      if (testimonialsContainer) {
        testimonialObserver.unobserve(testimonialsContainer);
      }
    };
  }, []);

  const testimonials = [
    {
      id: 3000,
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "This solution has transformed how our team works. The stacking cards interface makes it so easy to navigate through complex information."
    },
    {
      id: 3001,
      name: "Michael Chen",
      role: "Lead Developer",
      content: "The attention to detail in the animations and transitions makes this component not just functional but a joy to use. Our users love it!"
    }
  ];

  return (
    <div className="bg-gray-800 py-16">
      <div className="max-w-6xl mx-auto px-4 testimonials-container">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-100">What Our Users Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`card bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-700 transform ${
                testimonialsVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${index * 0.2}s`,
                ...cardPositions[testimonial.id] && {
                  transform: `translate(${cardPositions[testimonial.id].x}px, ${cardPositions[testimonial.id].y}px)`,
                  position: 'relative',
                  zIndex: dragState.cardId === testimonial.id ? 999 : 1,
                  transition: dragState.isDragging && dragState.cardId === testimonial.id ? 'none' : 'all 0.7s ease-out'
                }
              }}
            >
              {/* Mac-style title bar */}
              <div 
                className="bg-gradient-to-b from-gray-700 to-gray-800 px-4 py-2 flex items-center border-b border-gray-600" 
                style={{ cursor: 'grab', userSelect: 'none' }}
                onMouseDown={(e) => handleMouseDown(e, testimonial.id, 'testimonial', index)}
              >
                {/* Mac window buttons */}
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-200 flex-1 text-center">Testimonial</h3>
                <div className="w-16"></div> {/* Spacer for centering */}
              </div>
              
              {/* Card content */}
              <div className="p-6 bg-gray-900">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-xl text-gray-200">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;