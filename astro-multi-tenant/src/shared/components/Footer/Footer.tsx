import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <div className="text-3xl font-bold mb-4">CardStacker</div>
            <p className="text-indigo-200 max-w-xs">
              The enterprise solution for interactive information presentation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Releases</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-indigo-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-200 mb-4 md:mb-0">© 2025 CardStacker Enterprise. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
