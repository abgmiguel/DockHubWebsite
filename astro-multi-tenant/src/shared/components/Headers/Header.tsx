import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-900 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold mr-8">CardStacker</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-indigo-200 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-200 transition-colors">Examples</a>
            <a href="#" className="hover:text-indigo-200 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-200 transition-colors">About</a>
          </nav>
        </div>
        <div>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
