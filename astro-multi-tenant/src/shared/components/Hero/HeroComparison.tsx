import React from 'react';

interface HeroComparisonData {
  badge?: string;
  title?: {
    line1?: string;
    line2?: string;
    line3?: string;
  };
  description?: string[];
  cta?: {
    text?: string;
    link?: string;
  };
}

interface HeroComparisonProps {
  data?: HeroComparisonData;
}

const HeroComparison: React.FC<HeroComparisonProps> = ({ data = {} }) => {
  // Default values
  const badge = data.badge || "Coders in Flow vs. Competition";
  const title = data.title || {
    line1: "Coders in Flow",
    line2: "AI Powered Development team",
    line3: "in VS Code."
  };
  const description = data.description || [
    "Work 10x faster, its like having a full development team in the palm of your hands. Powerful AI coding assistant that works for engineers, developers and the average person, boosting productivity, code quality, and collaboration.",
    "When comparing Coders in Flow and other AI assistants, discover how our true multitasking platform with AI Companion capabilities can transform team collaboration, reduce costs, and enhance the experience for developers and customers."
  ];
  const cta = data.cta || {
    text: "↓ Scroll ↓ for more, or click for features",
    link: "/features"
  };
  return (
    <section className="relative bg-gradient-to-br from-[#0a0e27] via-[#151935] to-[#0a0e27] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            {/* Competitor badges */}
            <div className="flex items-center gap-2 mb-6 opacity-0 animate-fadeInDown animation-delay-100">
              <span className="text-gray-400 text-sm">{badge}</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="inline-block opacity-0 animate-slideInLeft animation-delay-200">
                {title.line1}
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent opacity-0 animate-slideInRight animation-delay-400">
                {title.line2}
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent opacity-0 animate-slideInLeft animation-delay-600">
                {title.line3}
              </span>
            </h1>
            
            {/* Description */}
            {description.map((text, index) => (
              <p 
                key={index}
                className={`text-gray-400 text-lg mb-8 leading-relaxed opacity-0 animate-fadeInUp animation-delay-${800 + (index * 200)}`}
              >
                {text}
              </p>
            ))}
            
            {/* CTA Button */}
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 opacity-0 animate-fadeInUp animation-delay-1200"
              onClick={() => window.location.href = cta.link}
            >
              {cta.text}
            </button>
          </div>
          
          {/* Right Images */}
          <div className="relative h-[400px] lg:h-[500px]">
            {/* Background glow effects */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-0 animate-fadeIn animation-delay-500" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-0 animate-fadeIn animation-delay-700" />
            
            {/* Main IDE Screenshot */}
            <div className="absolute top-0 right-0 w-[320px] md:w-[380px] hover:rotate-2 transition-transform duration-300 opacity-0 animate-slideInRightRotated animation-delay-1400"
                 style={{ transform: 'rotate(3deg)' }}>
              <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-400 text-xs ml-2">main.tsx</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-gray-700 rounded w-full mb-2" />
                      <div className="h-2 bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-3 border border-gray-700">
                    <div className="text-green-400 text-xs font-mono mb-1">// AI-generated code</div>
                    <div className="h-2 bg-gray-600 rounded w-full mb-1" />
                    <div className="h-2 bg-gray-600 rounded w-4/5 mb-1" />
                    <div className="h-2 bg-gray-600 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Card */}
            <div className="absolute bottom-0 left-0 w-[280px] md:w-[340px] hover:-rotate-2 transition-transform duration-300 opacity-0 animate-slideInLeftRotated animation-delay-1600"
                 style={{ transform: 'rotate(-3deg)' }}>
              <div className="bg-white rounded-xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-semibold">Compare with Coders in Flow AI Companion</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Experience 20+ concurrent tasks, full code analysis, automatic code correction, and 60% cost reduction compared 
                  to any other solution.
                </p>
                <button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  onClick={() => window.location.href = '/download'}
                >
                  Start Free →
                </button>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute top-10 left-10 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 text-green-400 text-sm font-semibold opacity-0 animate-bounceIn animation-delay-1800">
              20× Faster
            </div>
            
            <div className="absolute top-32 right-10 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm font-semibold opacity-0 animate-bounceIn animation-delay-2000">
              60% Cheaper
            </div>
            
            <div className="absolute bottom-32 right-20 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-400 text-sm font-semibold opacity-0 animate-bounceIn animation-delay-2200">
              100% Better
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRightRotated {
          from {
            opacity: 0;
            transform: translateX(100px) rotate(3deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotate(3deg);
          }
        }

        @keyframes slideInLeftRotated {
          from {
            opacity: 0;
            transform: translateX(-100px) rotate(-3deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotate(-3deg);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-slideInRightRotated {
          animation: slideInRightRotated 0.8s ease-out forwards;
        }

        .animate-slideInLeftRotated {
          animation: slideInLeftRotated 0.8s ease-out forwards;
        }

        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out forwards, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 2.5s;
        }

        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1200 { animation-delay: 1.2s; }
        .animation-delay-1400 { animation-delay: 1.4s; }
        .animation-delay-1600 { animation-delay: 1.6s; }
        .animation-delay-1800 { animation-delay: 1.8s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2200 { animation-delay: 2.2s; }
      `}</style>
    </section>
  );
};

export default HeroComparison;