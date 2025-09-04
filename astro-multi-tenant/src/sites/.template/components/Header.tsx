import React from 'react';

const Header: React.FC = () => {
  const header = {
    logo: { text: 'SITE_NAME_PLACEHOLDER', href: '/' },
    navigation: [
      { href: '/', text: 'Home' },
      { href: '#features', text: 'Features' },
      { href: '#about', text: 'About' },
      { href: '#contact', text: 'Contact' }
    ]
  };

  return (
    <nav className="bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href={header.logo.href} className="text-xl font-bold text-text-primary hover:text-primary transition-colors">
              {header.logo.text}
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {header.navigation.map((item) => (
              <a 
                key={item.href}
                href={item.href}
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                {item.text}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button"
              className="text-text-secondary hover:text-text-primary p-2"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;