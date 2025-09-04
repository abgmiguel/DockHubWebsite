import React, { useEffect, useState } from 'react';

interface PhoneMockupHeroProps {
  data: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    primaryButton: {
      text: string;
      link: string;
    };
    secondaryButton: {
      text: string;
      link: string;
    };
    phoneMockup: {
      appName: string;
      status: string;
      upButton: {
        label: string;
        color: string;
      };
      downButton: {
        label: string;
        color: string;
      };
    };
  };
}

const PhoneMockupHero: React.FC<PhoneMockupHeroProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-16 text-white relative overflow-hidden bg-gradient-to-br from-background via-surface to-background min-h-screen flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className={`absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl ${mounted ? 'animate-float-slow' : 'opacity-0'}`} />
        <div className={`absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl ${mounted ? 'animate-float-slow animation-delay-2000' : 'opacity-0'}`} />
        
        {/* Grid pattern */}
        <div 
          className={`absolute inset-0 opacity-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Text */}
          <div className="text-center md:text-left">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 mb-6 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <span className="px-4 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium">
                ⚓ Smart Boat Lift Controller
              </span>
            </div>

            {/* Title with staggered animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className={`inline-block ${mounted ? 'animate-slide-in-left' : 'opacity-0'}`}>
                {data.title}
              </span>{' '}
              <span className={`inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${mounted ? 'animate-slide-in-right animation-delay-200' : 'opacity-0'}`}>
                {data.titleHighlight}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg md:text-xl mb-8 text-text-secondary leading-relaxed ${mounted ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
              {data.subtitle}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a 
                href={data.primaryButton.link} 
                className={`px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-secondary text-text-inverse hover:shadow-lg hover:shadow-primary/50 transform hover:-translate-y-1 transition-all duration-300 ${mounted ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'}`}
              >
                {data.primaryButton.text}
              </a>
              <a 
                href={data.secondaryButton.link}
                className={`px-6 py-3 bg-transparent text-white border-2 border-primary rounded-full font-semibold hover:bg-primary/10 hover:border-secondary transform hover:-translate-y-1 transition-all duration-300 ${mounted ? 'animate-fade-in-up animation-delay-700' : 'opacity-0'}`}
              >
                {data.secondaryButton.text}
              </a>
            </div>

            {/* Feature badges */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
              {['No Monthly Fees', '10 Min Install', 'Works Offline'].map((feature, i) => (
                <span 
                  key={feature}
                  className={`px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium ${mounted ? `animate-bounce-in animation-delay-${900 + i * 100}` : 'opacity-0'}`}
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Phone Mockup with Feature Badges */}
          <div className="flex justify-center items-center gap-8 relative">
            {/* Glow effect behind phone */}
            <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl ${mounted ? 'animate-pulse-slow' : 'opacity-0'}`} />
            
            {/* Phone Container */}
            <div className={`relative ${mounted ? 'animate-slide-in-right-rotate animation-delay-400' : 'opacity-0'}`}>
              <div className="w-64 h-[32rem] bg-black rounded-[3rem] p-2 shadow-2xl border-2 border-primary/50 relative transform hover:rotate-2 transition-transform duration-300">
                {/* Phone notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
                
                {/* Screen */}
                <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden">
                  {/* App Header */}
                  <div className="w-11/12">
                    <div className="py-4 rounded-t-xl font-bold text-sm bg-gradient-to-r from-background to-surface text-primary text-center">
                      {data.phoneMockup.appName}
                    </div>
                    
                    {/* Control Interface */}
                    <div className="py-8 rounded-b-xl bg-white/5 backdrop-blur">
                      {/* Up Button with Pulse */}
                      <button className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 bg-gradient-to-br from-primary to-secondary text-text-inverse shadow-xl hover:scale-110 transition-transform ${mounted ? 'animate-pulse-glow' : ''}`}>
                        {data.phoneMockup.upButton.label}
                      </button>
                      
                      {/* Status */}
                      <div className="text-center mb-6">
                        <p className="text-sm text-gray-400 mb-1">Status</p>
                        <p className="text-lg font-medium text-primary">
                          {data.phoneMockup.status}
                        </p>
                      </div>
                      
                      {/* Down Button */}
                      <button 
                        className="w-24 h-24 rounded-full text-white flex items-center justify-center text-4xl font-bold mx-auto hover:scale-110 transition-transform shadow-xl"
                        style={{ backgroundColor: data.phoneMockup.downButton.color }}
                      >
                        {data.phoneMockup.downButton.label}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature badges stacked as separate div */}
            <div className="flex flex-col gap-3">
              <div className={`bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 text-green-400 text-sm font-semibold whitespace-nowrap ${mounted ? 'animate-slide-in-right animation-delay-1200' : 'opacity-0'}`}>
                ✓ Connected
              </div>
              <div className={`bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm font-semibold whitespace-nowrap ${mounted ? 'animate-slide-in-right animation-delay-1400' : 'opacity-0'}`}>
                📶 WiFi Ready
              </div>
              <div className={`bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-400 text-sm font-semibold whitespace-nowrap ${mounted ? 'animate-slide-in-right animation-delay-1600' : 'opacity-0'}`}>
                🔒 Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(5px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.8); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right-rotate {
          from { opacity: 0; transform: translateX(50px) rotate(-5deg); }
          to { opacity: 1; transform: translateX(0) rotate(0); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }

        .animate-slide-in-right-rotate {
          animation: slide-in-right-rotate 1s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1100 { animation-delay: 1100ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1300 { animation-delay: 1300ms; }
        .animation-delay-1400 { animation-delay: 1400ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-1600 { animation-delay: 1600ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </section>
  );
};

export default PhoneMockupHero;