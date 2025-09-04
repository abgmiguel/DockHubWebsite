import React, { useState, useEffect } from 'react';
import DraggableCustomizableCard from '../Cards/DraggableCustomizableCard';

interface Feature {
  title: string;
  description: string;
  gradient: string;
}

interface Card {
  id: number;
  title: string;
  width: number;
  height: number;
  gradient: string;
  marginTop?: string;
  header: {
    title: string;
    description: string;
  };
  features: Feature[];
  footer: {
    label: string;
    value: string;
  };
}

interface WhyBetterSectionProps {
  data?: {
    cards?: Card[];
  };
}

const WhyBetterSection: React.FC<WhyBetterSectionProps> = ({ data }) => {
  const defaultCards: Card[] = [
    {
      id: 1,
      title: "Advanced Code Understanding",
      width: 400,
      height: 560,
      gradient: "from-indigo-500 to-purple-500",
      header: {
        title: "Code Understanding",
        description: ""
      },
      features: [
        {
          title: "Automatic Codebase Documentation",
          description: "AI analyzes and documents your entire codebase. 50%+ reduction in token usage through deep understanding. Framework-specific intelligence (React vs Django vs Rails).",
          gradient: "from-indigo-500"
        },
        {
          title: "Intelligent Project Awareness",
          description: "Generates executive summaries of your architecture. Maps all component relationships automatically. Understands your specific design patterns.",
          gradient: "from-purple-500"
        },
        {
          title: "Context-Aware Search",
          description: "Customizes queries for YOUR tech stack. AST-aware code chunking for precision. Real-time index updates as you code.",
          gradient: "from-indigo-500"
        }
      ],
      footer: {
        label: "Automatic Context Compression",
        value: "Savings: 50%"
      }
    },
    {
      id: 2,
      title: "Optimized Cost Structure",
      width: 400,
      height: 560,
      gradient: "from-green-500 to-emerald-500",
      marginTop: "-35px",
      header: {
        title: "Optimized Cost Structure",
        description: "AI chooses the cheapest capable model for each task. Simple tasks → cheap models, Complex tasks → advanced models. Average 60% cost reduction."
      },
      features: [
        {
          title: "Automatic Model Selection",
          description: "AI chooses the cheapest capable model for each task.",
          gradient: "from-green-500"
        },
        {
          title: "Multi-Task Efficiency",
          description: "20+ concurrent tasks with focused contexts. Each subtask uses minimal tokens. Main context stays small = massive savings.",
          gradient: "from-emerald-500"
        },
        {
          title: "Smart Context Management",
          description: "Automatic conversation condensing. Token-perfect counting for every model. Budget enforcement per task or globally.",
          gradient: "from-green-500"
        }
      ],
      footer: {
        label: "Huge Savings",
        value: "Estimated: 50-75%"
      }
    },
    {
      id: 3,
      title: "Rapid Development",
      width: 400,
      height: 560,
      gradient: "from-orange-500 to-red-500",
      header: {
        title: "Next Generation Features",
        description: "True multi-tasking capabilities."
      },
      features: [
        {
          title: "Massive Parallelization",
          description: "Run 20+ AI tasks simultaneously. Complete hours of work in minutes. Automatic task decomposition and routing.",
          gradient: "from-orange-500"
        },
        {
          title: "Enterprise Cloud & Team Management",
          description: "Complete cloud backup of all conversations. Monitor your entire dev team's AI usage. Synchronize modes across your organization. View comprehensive reports for management.",
          gradient: "from-red-500"
        },
        {
          title: "Mobile Continuity",
          description: "Native iOS app with real-time sync. Start on desktop, continue on iPhone. Zero context switches.",
          gradient: "from-orange-500"
        }
      ],
      footer: {
        label: "Full Cloud Enterprise Solution",
        value: "More Savings"
      }
    }
  ];

  const cards = data?.cards || defaultCards;
  const [cardsVisible, setCardsVisible] = useState<boolean[]>(new Array(cards.length).fill(false));

  useEffect(() => {
    // Animate cards in sequence when component mounts
    const timers: NodeJS.Timeout[] = [];
    cards.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCardsVisible(prev => {
            const newVisible = [...prev];
            newVisible[index] = true;
            return newVisible;
          });
        }, 100 + (index * 300))
      );
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [cards.length]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {cards.map((card, index) => (
            <div 
              key={card.id}
              className={`flex justify-center transition-all duration-700 transform ${
                cardsVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ marginTop: card.marginTop || '0' }}
            >
              <DraggableCustomizableCard 
                width={card.width} 
                height={card.height}
                title={card.title}
              >
                <div className="h-full flex flex-col p-2">
                  <div className="mb-6">
                    <div className={`h-1 w-16 bg-gradient-to-r ${card.gradient} mb-4 transition-all duration-500 hover:w-24`}></div>
                    <h4 className="text-2xl font-bold text-gray-100 mb-3">{card.header.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{card.header.description}</p>
                  </div>
                  <div className="space-y-5 text-left flex-1">
                    {card.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="group">
                        <div className="flex items-start">
                          <div className={`w-1 h-12 bg-gradient-to-b ${feature.gradient} to-transparent mr-4 transition-all duration-300 group-hover:h-14`}></div>
                          <div>
                            <h5 className="text-sm font-semibold text-gray-200 mb-1">{feature.title}</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{card.footer.label}</span>
                      <span>{card.footer.value}</span>
                    </div>
                  </div>
                </div>
              </DraggableCustomizableCard>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default WhyBetterSection;