import React, { useState, useEffect, useRef } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon?: string;
}

interface StepByStepProcessProps {
  data: {
    title: string;
    subtitle?: string;
    steps: Step[];
  };
}

const StepByStepProcess: React.FC<StepByStepProcessProps> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Activate steps sequentially
          data.steps.forEach((_, index) => {
            setTimeout(() => {
              setActiveStep(current => {
                if (current === null || current < index) {
                  return index;
                }
                return current;
              });
            }, 800 + index * 600);
          });
          
          // Animate progress bar
          setTimeout(() => {
            setProgressWidth(100);
          }, 500);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, data.steps]);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl ${isVisible ? 'animate-float-slow' : 'opacity-0'}`} />
        <div className={`absolute bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl ${isVisible ? 'animate-float-slow animation-delay-3000' : 'opacity-0'}`} />
        
        {/* Decorative dots pattern */}
        <div className={`absolute inset-0 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="absolute top-20 left-20 w-2 h-2 bg-primary/20 rounded-full" />
          <div className="absolute top-32 right-32 w-3 h-3 bg-secondary/20 rounded-full" />
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-primary/20 rounded-full" />
          <div className="absolute bottom-40 right-20 w-4 h-4 bg-secondary/20 rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Animated Badge */}
        <div className={`text-center mb-8 ${isVisible ? 'animate-bounce-in' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
            🚀 Quick & Easy Setup
          </span>
        </div>

        {/* Animated Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className={`inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${isVisible ? 'animate-slide-in-up' : 'opacity-0'}`}>
              {data.title}
            </span>
          </h2>
          {data.subtitle && (
            <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isVisible ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="relative">
          {/* Animated connection line for desktop */}
          <div className="hidden lg:block absolute top-[140px] left-[15%] right-[15%] h-1 bg-gray-200 rounded-full z-0">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all ease-out shadow-lg shadow-primary/20"
              style={{
                width: `${progressWidth}%`,
                transitionDuration: '3s',
                transitionDelay: '0.5s'
              }}
            />
            {/* Glowing dot at the end of progress */}
            {progressWidth > 0 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full animate-pulse-glow"
                style={{
                  left: `${progressWidth}%`,
                  transition: 'left 3s ease-out 0.5s'
                }}
              />
            )}
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {data.steps.map((step, index) => (
              <div
                key={index}
                className={`${activeStep !== null && index <= activeStep ? 'animate-scale-in-bounce' : 'opacity-0'}`}
                style={{ animationDelay: `${800 + index * 600}ms` }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="text-center">
                  {/* Step number circle with animations */}
                  <div className="relative mb-8 flex justify-center">
                    {/* Background glow */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredStep === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl" />
                    </div>
                    
                    {/* Main circle */}
                    <div className={`
                      relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold
                      transition-all duration-500 transform
                      ${activeStep !== null && index <= activeStep 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/30' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'}
                      ${hoveredStep === index ? 'scale-110 rotate-3' : ''}
                    `}>
                      {step.icon || step.number}
                      
                      {/* Rotating border decoration */}
                      {activeStep !== null && index <= activeStep && (
                        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="none"
                            stroke="url(#gradient-${index})"
                            strokeWidth="1"
                            strokeDasharray="8 4"
                            opacity="0.3"
                          />
                          <defs>
                            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#00ff88" />
                              <stop offset="100%" stopColor="#00cc6a" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>
                    
                    {/* Pulse effect for latest active step */}
                    {activeStep === index && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full animate-ping opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* Step content card */}
                  <div className={`
                    relative bg-white rounded-2xl p-8 shadow-xl transition-all duration-500 transform
                    ${activeStep !== null && index <= activeStep 
                      ? 'border border-primary/10' 
                      : 'border border-gray-100'}
                    ${hoveredStep === index 
                      ? 'shadow-2xl -translate-y-2 scale-105 border-primary/30' 
                      : ''}
                  `}>
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-full transition-all duration-500 ${
                      hoveredStep === index ? 'opacity-100' : 'opacity-0'
                    }`} />
                    
                    <h3 className="text-2xl font-bold mb-4 text-background">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Step number badge */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold transition-transform duration-300 ${
                      hoveredStep === index ? 'scale-110 rotate-12' : ''
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Check mark for completed steps */}
                    {activeStep !== null && index < activeStep && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white animate-bounce-in">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile progress indicators */}
        <div className="lg:hidden mt-12 flex justify-center">
          <div className="flex gap-3">
            {data.steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-700 ${
                  activeStep !== null && index <= activeStep 
                    ? 'w-12 bg-gradient-to-r from-primary to-secondary' 
                    : 'w-8 bg-gray-300'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(30px, -30px) rotate(5deg) scale(1.05); }
          50% { transform: translate(-20px, 20px) rotate(-3deg) scale(0.95); }
          75% { transform: translate(20px, -10px) rotate(2deg) scale(1.02); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in-bounce {
          0% { opacity: 0; transform: scale(0.5); }
          60% { transform: scale(1.1); }
          80% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
            transform: translateY(-50%) scale(1);
          }
          50% { 
            box-shadow: 0 0 20px 10px rgba(0, 255, 136, 0);
            transform: translateY(-50%) scale(1.5);
          }
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-scale-in-bounce {
          animation: scale-in-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-3000 { animation-delay: 3000ms; }
      `}</style>
    </section>
  );
};

export default StepByStepProcess;