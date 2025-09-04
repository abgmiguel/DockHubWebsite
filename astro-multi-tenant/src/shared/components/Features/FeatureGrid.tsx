import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icons/Icons';

interface Feature {
  id: number;
  title: string;
  items: string[];
  icon: string;
  gradient: string;
  pattern: string;
  className: string;
  mobileClass: string;
  hasImage?: boolean;
  imageSrc?: string;
  learnMoreLink?: string;
}

interface FeatureGridProps {
  data?: {
    features?: Feature[];
  };
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ data }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Use data from props or fall back to defaults
  const defaultFeatures: Feature[] = [
    {
      id: 1,
      title: 'iPhone & Android App',
      items: [
        'Continue working when you leave the house',
        'Full control of AI, including Claude Code',
        'Coming soon: full iPad app with editor'
      ],
      icon: 'Smartphone',
      gradient: 'from-blue-600 to-purple-700',
      pattern: 'circuit',
      className: 'col-span-2 row-span-2',
      mobileClass: 'col-span-1',
      hasImage: true,
      imageSrc: '/iphone-v2.png',
      learnMoreLink: '/features#mobile-apps'
    },
    {
      id: 2,
      title: 'Powerful Codebase Search',
      items: [
        'Most advanced codebase-aware search',
        'Queries complete instantly',
        'Works with Claude Code',
        'Semantic Search with Vector DB'
      ],
      icon: "Search",
      gradient: 'from-emerald-600 to-teal-700',
      pattern: 'grid',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 3,
      title: 'Context Editor',
      items: [
        'Delete unneeded parts',
        'Visualize usage at a glance',
        'Save money'
      ],
      icon: "Edit3",
      gradient: 'from-pink-600 to-rose-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      learnMoreLink: '/features#context-control'
    },
    {
      id: 4,
      title: 'Claude Code Integration',
      items: [
        'Full Claude Code Integration',
        'No longer relegated to command prompt',
        'Git aware, tool aware',
        'Attach files & images easily'
      ],
      icon: "Code2",
      gradient: 'from-indigo-600 to-purple-700',
      pattern: 'waves',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1',
      learnMoreLink: '/features#codebase-intelligence'
    },
    {
      id: 5,
      title: 'MCP Marketplace',
      items: [
        'Built-in MCP marketplace',
        'Instantly find and install MCP Servers'
      ],
      icon: "Store",
      gradient: 'from-orange-600 to-red-600',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 6,
      title: 'Full Featured Git System',
      items: [
        'Built-in shadow git system',
        'Git integration with selective approval',
        'Shadow git and normal git integration'
      ],
      icon: "GitBranch",
      gradient: 'from-slate-700 to-gray-900',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1',
      learnMoreLink: '/features#git-management'
    },
    {
      id: 7,
      title: 'Real-Time Cost Visualization',
      items: [
        'Claude Code statistics',
        'Visualize your savings',
        'Watch your cost live'
      ],
      icon: "DollarSign",
      gradient: 'from-green-600 to-emerald-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 8,
      title: 'Tool Correction',
      items: [
        'No failed tool calls',
        'Automatically correct errors',
        'Prevent failures'
      ],
      icon: "Wrench",
      gradient: 'from-amber-600 to-yellow-600',
      pattern: 'grid',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 9,
      title: 'Model Optimizations',
      items: [
        'Prioritize lower cost models',
        'Squeeze performance from all models',
        'Great local model support'
      ],
      icon: "Brain",
      gradient: 'from-purple-600 to-pink-600',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 10,
      title: 'Todo List Generation',
      items: [
        'Generate plans automatically',
        'Claude Code and all AIs support',
        'Same system across all models'
      ],
      icon: "ListTodo",
      gradient: 'from-cyan-600 to-blue-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 11,
      title: 'Project Detection',
      items: [
        'Generate project summary with details',
        'AI instantly knows your project',
        'Auto adds project-specific rules'
      ],
      icon: "Folder",
      gradient: 'from-violet-600 to-indigo-700',
      pattern: 'waves',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 12,
      title: 'Cheap Models Support',
      items: [
        'Amazing support for low-cost models',
        'Optimize code for low-cost models',
        'Unlimited tool calls per query'
      ],
      icon: "Coins",
      gradient: 'from-teal-600 to-cyan-700',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 13,
      title: 'Memory Bank',
      items: [
        'Built-in memory bank',
        'AI doesn\'t lose its memory'
      ],
      icon: "Database",
      gradient: 'from-red-600 to-pink-700',
      pattern: 'dots',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 14,
      title: 'Intelligent Codebase',
      items: [
        'Modular codebase, easy to analyze',
        'Built from scratch, easy to add features',
        'Smart usage of structure'
      ],
      icon: "Cpu",
      gradient: 'from-gray-700 to-slate-900',
      pattern: 'grid',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 15,
      title: 'Mermaid Charts',
      items: [
        'Instantly generate mermaid charts',
        'Visualize your codebase'
      ],
      icon: "ChartBar",
      gradient: 'from-lime-600 to-green-700',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 16,
      title: 'Enterprise Dashboard',
      items: [
        'Monitor entire dev team',
        'Real-time productivity metrics',
        'ROI tracking and reports'
      ],
      icon: "Users",
      gradient: 'from-blue-700 to-indigo-800',
      pattern: 'grid',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 17,
      title: 'Subtask Parallelization',
      items: [
        '20+ concurrent tasks',
        'Automatic task decomposition',
        'Lightning-fast development'
      ],
      icon: "Zap",
      gradient: 'from-yellow-600 to-orange-700',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 18,
      title: 'Multi-Channel Logging',
      items: [
        'ID-based filtering',
        'Persistent file logs',
        'SQLite analytics'
      ],
      icon: "Layers",
      gradient: 'from-teal-700 to-blue-800',
      pattern: 'waves',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 19,
      title: 'Framework Detection',
      items: [
        'Auto-detect tech stack',
        'Custom search patterns',
        'Smart documentation generation'
      ],
      icon: "FileSearch",
      gradient: 'from-purple-700 to-pink-700',
      pattern: 'waves',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 20,
      title: 'Selective Staging',
      items: [
        'Chunk-level change control',
        'Perfect human-AI collaboration',
        'Review changes individually'
      ],
      icon: "GitMerge",
      gradient: 'from-teal-700 to-cyan-800',
      pattern: 'dots',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 21,
      title: 'Cloud Sync & Backup',
      items: [
        'Automatic cloud backup',
        'Cross-device continuity',
        'Never lose your work'
      ],
      icon: "Cloud",
      gradient: 'from-sky-600 to-blue-700',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 22,
      title: 'Real-Time Analytics',
      items: [
        'Live performance metrics',
        'Usage statistics',
        'Cost breakdowns by task'
      ],
      icon: "Activity",
      gradient: 'from-emerald-700 to-green-800',
      pattern: 'grid',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 23,
      title: 'Provider Management',
      items: [
        'Dynamic provider system',
        'Add providers via JSON',
        'No code changes needed'
      ],
      icon: "BarChart3",
      gradient: 'from-indigo-700 to-purple-800',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 24,
      title: 'Connection Resilience',
      items: [
        'Auto-reconnection',
        'Provider failover',
        'Offline mode support'
      ],
      icon: "RefreshCw",
      gradient: 'from-emerald-700 to-teal-800',
      pattern: 'diagonal',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 25,
      title: 'Native Claude Code',
      items: [
        'First-class integration',
        'Official Anthropic CLI',
        'Enhanced with visual UI'
      ],
      icon: "Code2",
      gradient: 'from-orange-700 to-red-800',
      pattern: 'dots',
      className: 'col-span-2 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 26,
      title: 'Security & Compliance',
      items: [
        'SOC2 compliant',
        'GDPR ready',
        'Enterprise SSO support'
      ],
      icon: "Shield",
      gradient: 'from-gray-700 to-slate-800',
      pattern: 'grid',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    },
    {
      id: 27,
      title: 'File Access Queue',
      items: [
        'Prevent race conditions',
        'Atomic operations',
        'Transaction support'
      ],
      icon: "Lock",
      gradient: 'from-purple-700 to-indigo-800',
      pattern: 'circuit',
      className: 'col-span-1 row-span-1',
      mobileClass: 'col-span-1'
    }
  ];

  const features = data?.features || defaultFeatures;
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false));
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Animate cards in sequence
          features.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 80); // Stagger by 80ms per card
          });
          
          // Unobserve after animation starts
          if (gridRef.current) {
            observer.unobserve(gridRef.current);
          }
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the grid is visible
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, []);

  const renderPattern = (pattern, id) => {
    const patternId = `${pattern}-${id}`;
    switch (pattern) {
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-10">
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
          <div className="absolute inset-0 opacity-10">
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
          <div className="absolute inset-0 opacity-10">
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
          <div className="absolute inset-0 opacity-10">
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
          <div className="absolute inset-0 opacity-10">
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
    <div className="w-full" ref={gridRef}>
      {/* Grid Container */}
      <div className="relative">
        {/* Desktop Grid - 4 columns, smaller row height */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${feature.className} relative group overflow-hidden rounded-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                if (feature.learnMoreLink) {
                  window.location.href = feature.learnMoreLink;
                }
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Pattern Overlay */}
              {renderPattern(feature.pattern, feature.id)}
              
              {/* Animated Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700 scale-150`} />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                   style={{padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}} />
              
              {/* Content */}
              <div className="relative z-10 p-5 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-white/90 flex-shrink-0">
                    <Icon name={feature.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight">{feature.title}</h3>
                </div>
                
                <ul className="text-white/70 text-xs space-y-1 flex-grow">
                  {feature.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-white/40 mr-2 mt-0.5">•</span>
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* iPhone Image */}
              {feature.hasImage && feature.imageSrc && (
                <div className="absolute bottom-0 right-0 w-80 h-96 pointer-events-none">
                  <img 
                    src={feature.imageSrc} 
                    alt="iPhone App Preview" 
                    className="absolute bottom-0 right-0 w-full h-full object-contain object-bottom-right transform translate-x-16 translate-y-24 group-hover:translate-y-16 transition-transform duration-500"
                  />
                </div>
              )}
              
              {/* Corner Decoration */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Mobile Grid - Single Column */}
        <div className="sm:hidden grid grid-cols-1 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`relative group overflow-hidden rounded-xl transition-all duration-700 hover:shadow-2xl cursor-pointer transform ${
                visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                if (feature.learnMoreLink) {
                  window.location.href = feature.learnMoreLink;
                }
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-95`} />
              
              {/* Pattern Overlay */}
              {renderPattern(feature.pattern, feature.id)}
              
              {/* Border */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
              
              {/* Content */}
              <div className="relative z-10 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-white/90 flex-shrink-0">
                    <Icon name={feature.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                </div>
                
                <ul className="text-white/70 text-sm space-y-1">
                  {feature.items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-white/40 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;