import React, { useEffect } from 'react';

const HeaderData = ({ data = {} }) => {
  const {
    logo = { text: "CodersInFlow", href: "/" },
    navigation = [],
    social = [],
    cta = { text: "Install", href: "/download" }
  } = data;

  useEffect(() => {
    // Add mobile menu toggle functionality
    const handleMobileMenu = () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
      }
    };

    const menuButton = document.getElementById('mobile-menu-button');
    if (menuButton) {
      menuButton.addEventListener('click', handleMobileMenu);
      return () => menuButton.removeEventListener('click', handleMobileMenu);
    }
  }, []);

  const SocialIcon = ({ icon }) => {
    if (icon === 'discord') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125 10.2 10.2 0 0 0 .372-.291.072.072 0 0 1 .076-.01c3.927 1.764 8.18 1.764 12.061 0a.071.071 0 0 1 .076.009c.12.098.246.198.373.292a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
      );
    }
    if (icon === 'reddit') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href={logo.href} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <span className="text-text-primary font-semibold hidden sm:inline">{logo.text}</span>
        </a>

        {/* Navigation Menu - Centered */}
        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-6">
          {navigation.map((link, index) => (
            <a key={index} href={link.href} className="text-text-secondary hover:text-link-hover transition-colors">
              {link.text}
            </a>
          ))}
        </nav>

        {/* Desktop only */}
        <div className="hidden md:flex items-center space-x-4">
          {social.map((link, index) => (
            <a key={index} href={link.href} target="_blank" className="text-text-secondary hover:text-link-hover transition-colors" aria-label={link.name}>
              <SocialIcon icon={link.icon} />
            </a>
          ))}
          <a href={cta.href} className="px-4 py-2 bg-primary text-text-inverse rounded hover:bg-primary/90">{cta.text}</a>
        </div>

        {/* Mobile menu button */}
        <button id="mobile-menu-button" className="sm:hidden p-2">
          <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        {/* Mobile: Social links and Get Started button */}
        <div className="hidden sm:flex md:hidden items-center space-x-3">
          {social.map((link, index) => (
            <a key={index} href={link.href} target="_blank" className="text-text-secondary hover:text-link-hover transition-colors" aria-label={link.name}>
              <SocialIcon icon={link.icon} />
            </a>
          ))}
          <a href={cta.href} className="px-4 py-2 bg-primary text-text-inverse rounded hover:bg-primary/90 text-sm">{cta.text}</a>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden sm:hidden bg-surface-hover border-t border-border">
        <div className="px-4 py-4 space-y-3">
          {navigation.map((link, index) => (
            <a key={index} href={link.href} className="block text-text-secondary hover:text-link-hover">
              {link.text}
            </a>
          ))}
          <hr className="border-border" />
          <div className="flex items-center space-x-4 pt-2">
            {social.map((link, index) => (
              <a key={index} href={link.href} target="_blank" className="text-text-secondary hover:text-link-hover transition-colors" aria-label={link.name}>
                <SocialIcon icon={link.icon} />
              </a>
            ))}
          </div>
          <a href={cta.href} className="block px-4 py-2 bg-primary text-text-inverse rounded text-center hover:bg-primary/90">{cta.text}</a>
        </div>
      </div>
    </header>
  );
};

export default HeaderData;