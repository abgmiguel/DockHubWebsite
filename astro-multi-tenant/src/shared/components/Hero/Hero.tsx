import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-16">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-2">
          Intuitive. <span className="text-indigo-400">Powerful.</span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-medium mb-6 text-gray-300">with visual studio code</h2>
        <p className="text-xl md:text-2xl mb-4 text-gray-300">
          AI-Powered Code Assistance: Efficient, Affordable, Effective
        </p>
        <p className="text-md md:text-lg mb-12 text-gray-400 max-w-3xl mx-auto">
          Leverage multi-edits and smarter model utilization to provide full context like results—at a fraction of the cost.
        </p>
        <div className="animate-bounce">
          <svg className="w-8 h-8 mx-auto text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;
