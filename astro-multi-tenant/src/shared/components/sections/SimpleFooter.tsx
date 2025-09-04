import React from 'react';

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface DockHubFooterProps {
  data: {
    logo?: string;
    description?: string;
    sections?: FooterSection[];
    copyright?: string;
    links?: FooterLink[];
  };
}

const DockHubFooter: React.FC<DockHubFooterProps> = ({ data }) => {
  return (
    <footer className="bg-background text-white py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold mb-4 text-primary">
              {data.logo || '⚓ DockHub'}
            </div>
            {data.description && (
              <p className="text-text-secondary">
                {data.description}
              </p>
            )}
          </div>

          {/* Footer Sections */}
          {data.sections && data.sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 text-text-primary">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className="text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-muted text-sm mb-4 md:mb-0">
            {data.copyright || '© 2024 DockHub. All rights reserved.'}
          </p>
          
          {/* Social Links */}
          {data.links && data.links.length > 0 && (
            <div className="flex gap-4">
              {data.links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-text-secondary hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default DockHubFooter;