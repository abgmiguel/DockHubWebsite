import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Layers, 
  Code2, 
  Palette,
  Cpu,
  Lock,
  Workflow,
  FileCode2,
  Braces,
  Terminal,
  GitBranch,
  Database,
  Cloud,
  Boxes
} from 'lucide-react';

const GridLayout = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: 1,
      title: 'MCP',
      description: 'Pull in additional context and work with 100+ external tools for your stack.',
      icon: <Layers className="w-12 h-12" />,
      gradient: 'from-slate-700 to-gray-900',
      pattern: 'circuit',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '2×1'
    },
    {
      id: 2,
      title: 'Images',
      description: 'Add screenshots and wireframes to include additional context.',
      icon: <Palette className="w-10 h-10" />,
      gradient: 'from-blue-600 to-cyan-700',
      pattern: 'grid',
      className: 'col-span-1 row-span-2',
      mobileClass: 'col-span-1 row-span-1',
      dimensions: '1×2'
    },
    {
      id: 3,
      title: 'Smart Apply',
      description: 'Apply suggestions from chat intelligently to your code in one click.',
      icon: <Zap className="w-12 h-12" />,
      gradient: 'from-purple-600 to-pink-600',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    },
    {
      id: 4,
      title: 'Security',
      description: 'Your code is secure and private by default.',
      icon: <Shield className="w-8 h-8" />,
      gradient: 'from-green-600 to-emerald-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    },
    {
      id: 5,
      title: 'Context',
      description: 'Prioritize specific files in your code.',
      icon: <FileCode2 className="w-8 h-8" />,
      gradient: 'from-indigo-600 to-purple-700',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    },
    {
      id: 6,
      title: 'Version Control',
      description: 'Seamless Git integration with visual diff tools, branch management, and commit history.',
      icon: <GitBranch className="w-14 h-14" />,
      gradient: 'from-orange-600 to-red-600',
      pattern: 'waves',
      className: 'col-span-2 row-span-2',
      mobileClass: 'col-span-1 row-span-1',
      dimensions: '2×2'
    },
    {
      id: 7,
      title: 'AI Assistant',
      description: 'Intelligent code completion.',
      icon: <Cpu className="w-8 h-8" />,
      gradient: 'from-teal-600 to-cyan-700',
      pattern: 'grid',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    },
    {
      id: 8,
      title: 'Cloud Sync',
      description: 'Access from anywhere.',
      icon: <Cloud className="w-8 h-8" />,
      gradient: 'from-pink-600 to-rose-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    },
    {
      id: 9,
      title: 'Database',
      description: 'Query and visualize your data seamlessly.',
      icon: <Database className="w-10 h-10" />,
      gradient: 'from-amber-600 to-orange-700',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-2',
      mobileClass: 'col-span-1 row-span-1',
      dimensions: '1×2'
    },
    {
      id: 10,
      title: 'Extensions',
      description: 'Customize your workflow with powerful plugins.',
      icon: <Boxes className="w-10 h-10" />,
      gradient: 'from-violet-600 to-indigo-700',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      dimensions: '1×1'
    }
  ];

  const renderPattern = (pattern, id) => {
    const patternId = `${pattern}-${id}`;
    switch (pattern) {
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'diagonal':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,40 L40,0" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q 25 0 50 10 T 100 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      case 'circuit':
        return (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id={patternId} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="3" fill="currentColor" />
                <path d="M30,0 L30,27 M30,33 L30,60 M0,30 L27,30 M33,30 L60,30" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-[150px] opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-[200px] opacity-10" />
      </div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">Developer Suite</h1>
            <p className="text-gray-400 text-lg mt-1">Everything you need to build amazing products</p>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-[300px]">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`${card.className} relative group overflow-hidden rounded-2xl lg:rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Pattern Overlay */}
              {renderPattern(card.pattern, card.id)}
              
              {/* Animated Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700 scale-150`} />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                   style={{padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}} />
              
              {/* Dimensions Badge */}
              <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-white/60 text-xs font-mono">
                {card.dimensions}
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-white mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {card.icon}
                  </div>
                  <h3 className="text-white font-bold text-xl lg:text-2xl mb-3">{card.title}</h3>
                  <p className="text-white/70 text-sm lg:text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">{card.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors duration-300">
                    <span className="text-xs uppercase tracking-wider font-medium">Learn more</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {hoveredCard === card.id && (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse delay-150" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Corner Decoration */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Mobile Grid - Single Column */}
        <div className="sm:hidden grid grid-cols-1 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative group overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl cursor-pointer h-[250px]"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-95`} />
              
              {/* Pattern Overlay */}
              {renderPattern(card.pattern, card.id)}
              
              {/* Border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="text-white mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{card.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{card.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-white/50 mt-4">
                  <span className="text-xs uppercase tracking-wider">Learn more</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Gradient Line */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-70" />

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/60">
        <span className="sm:hidden">Mobile (1 col)</span>
        <span className="hidden sm:inline lg:hidden">Tablet (2 cols)</span>
        <span className="hidden lg:inline xl:hidden">Desktop (3 cols)</span>
        <span className="hidden xl:inline">Large (4 cols)</span>
      </div>
    </div>
  );
};

export default GridLayout;