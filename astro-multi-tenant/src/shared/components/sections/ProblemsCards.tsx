import React, { useState, useEffect, useRef } from 'react';

interface Problem {
  emoji: string;
  title: string;
  description: string;
  highlightText?: string;
}

interface ProblemsCardsProps {
  data: {
    title: string;
    subtitle: string;
    problems: Problem[];
  };
}

const ProblemsCards: React.FC<ProblemsCardsProps> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [cardsVisible, setCardsVisible] = useState<boolean[]>(new Array(data.problems.length).fill(false));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Stagger card animations
          data.problems.forEach((_, index) => {
            setTimeout(() => {
              setCardsVisible(prev => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 150);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, data.problems]);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 -left-20 w-96 h-96 bg-red-100/30 rounded-full blur-3xl ${isVisible ? 'animate-float-slow' : 'opacity-0'}`} />
        <div className={`absolute bottom-20 -right-20 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl ${isVisible ? 'animate-float-slow animation-delay-3000' : 'opacity-0'}`} />
        
        {/* Grid pattern */}
        <div 
          className={`absolute inset-0 opacity-[0.02] ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
          style={{
            backgroundImage: `linear-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Animated Badge */}
        <div className={`text-center mb-8 ${isVisible ? 'animate-bounce-in' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-600 text-sm font-medium">
            ⚠️ Common Challenges
          </span>
        </div>

        {/* Animated Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className={`inline-block text-background ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              {data.title.split(' ').slice(0, -2).join(' ')}
            </span>{' '}
            <span className={`inline-block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent ${isVisible ? 'animate-slide-in-right animation-delay-200' : 'opacity-0'}`}>
              {data.title.split(' ').slice(-2).join(' ')}
            </span>
          </h2>
          {data.subtitle && (
            <p className={`text-lg text-gray-600 ${isVisible ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Animated Problem Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.problems.map((problem, index) => (
            <div
              key={index}
              className={`relative ${cardsVisible[index] ? 'animate-scale-in-rotate' : 'opacity-0'}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl blur-xl transition-opacity duration-300 ${
                hoveredCard === index ? 'opacity-100' : 'opacity-0'
              }`} />
              
              <div className={`relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500 transform ${
                hoveredCard === index 
                  ? 'shadow-2xl scale-105 -translate-y-2 border-red-200' 
                  : 'shadow-lg hover:shadow-xl'
              }`}>
                {/* Emoji with pulse animation on hover */}
                <div className={`text-5xl mb-6 transition-transform duration-300 ${
                  hoveredCard === index ? 'scale-110 animate-pulse-emoji' : ''
                }`}>
                  {problem.emoji}
                </div>
                
                {/* Title with gradient underline */}
                <h3 className="text-xl font-bold mb-3 text-background relative">
                  {problem.title}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 ${
                    hoveredCard === index ? 'w-full' : 'w-0'
                  }`} />
                </h3>
                
                {/* Description with highlight */}
                <p className="text-gray-600 leading-relaxed">
                  {problem.highlightText ? (
                    <>
                      {problem.description.split(problem.highlightText)[0]}
                      <span className={`inline-block px-2 py-0.5 rounded font-medium transition-all duration-300 ${
                        hoveredCard === index 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white scale-105' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {problem.highlightText}
                      </span>
                      {problem.description.split(problem.highlightText)[1]}
                    </>
                  ) : (
                    problem.description
                  )}
                </p>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-20 h-20 transition-all duration-500 ${
                  hoveredCard === index ? 'scale-110' : 'scale-100'
                }`}>
                  <svg className="w-full h-full" viewBox="0 0 80 80">
                    <path 
                      d="M0,0 L80,0 L80,80 Q80,0 0,0" 
                      fill="url(#grad-${index})" 
                      opacity="0.1"
                    />
                    <defs>
                      <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor:'rgb(239, 68, 68)', stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:'rgb(251, 146, 60)', stopOpacity:1}} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Index number badge */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 ${
                  hoveredCard === index ? 'scale-110 rotate-12' : ''
                }`}>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, -10px) scale(1.02); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.02; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in-rotate {
          from { 
            opacity: 0; 
            transform: scale(0.8) rotate(-5deg);
          }
          to { 
            opacity: 1; 
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes pulse-emoji {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
        }

        .animate-float-slow {
          animation: float-slow 25s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-scale-in-rotate {
          animation: scale-in-rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-pulse-emoji {
          animation: pulse-emoji 2s ease-in-out infinite;
        }

        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-3000 { animation-delay: 3000ms; }
      `}</style>
    </section>
  );
};

export default ProblemsCards;