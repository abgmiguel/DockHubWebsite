import React from 'react';

const FooterData = ({ data = {} }) => {
  const {
    sisterProject = {
      title: "Sister Project",
      description: "Check out Ultimate Router OS - Enterprise-grade routing solutions based on Linux",
      linkText: "Visit darkflows.com",
      linkHref: "https://darkflows.com"
    },
    copyright = "© 2025 Coders in Flow. All rights reserved.",
    links = []
  } = data;

  return (
    <footer className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Sister Project Section */}
        <div className="border-b border-indigo-700 pb-8 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{sisterProject.title}</h3>
            <p className="text-indigo-200 mb-4">{sisterProject.description}</p>
            <a href={sisterProject.linkHref} target="_blank" className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors">
              {sisterProject.linkText}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-200 mb-4 md:mb-0">{copyright}</p>
          <div className="flex space-x-6">
            {links.map((link, index) => (
              <a key={index} href={link.href} target="_blank" className="text-indigo-200 hover:text-white transition-colors">
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterData;