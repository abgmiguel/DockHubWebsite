import React, { useEffect, useRef } from 'react';

interface ComparisonTableProps {
  data: any;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  const comparisonData = data;
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add intersection observer for row animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const rows = tableRef.current?.querySelectorAll('tbody tr');
    rows?.forEach((row) => observer.observe(row));

    return () => {
      rows?.forEach((row) => observer.unobserve(row));
    };
  }, []);

  return (
    <div className="comparison-section bg-black py-8 md:py-16 px-4 md:px-6 relative overflow-x-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute top-0 left-[20%] w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-[40%] w-96 h-96 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-[2]">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift">
            {comparisonData.header.title}
          </h1>
          <p className="text-gray-400 text-sm md:text-xl max-w-2xl mx-auto mb-4 md:mb-6 px-4">
            {comparisonData.header.subtitle}
          </p>
          <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold animate-pulse-subtle">
            {comparisonData.header.badge}
          </span>
        </div>

        {/* Table Wrapper */}
        <div ref={tableRef} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg md:rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b-2 border-gray-800">
                <tr>
                  <th className="sticky left-0 z-10 bg-black/90 backdrop-blur-sm px-3 md:px-8 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Feature
                  </th>
                  {comparisonData.competitors.map((competitor) => (
                    <th
                      key={competitor.key}
                      className={`px-2 md:px-4 py-3 md:py-4 text-center text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap ${
                        competitor.highlight
                          ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 text-white relative overflow-hidden'
                          : 'text-gray-400'
                      }`}
                    >
                      {competitor.highlight && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer" />
                      )}
                      <span className="relative">
                        {competitor.name} {competitor.icon}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.features.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800/50 hover:bg-blue-500/5 transition-colors duration-300 opacity-0 animate-fade-in-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="sticky left-0 z-10 bg-gray-900/95 backdrop-blur-sm px-3 md:px-8 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-200 relative group">
                      <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-0.5 md:w-1 h-4 md:h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {feature.link ? (
                        <a 
                          href={feature.link} 
                          className="block md:inline hover:text-blue-400 transition-colors cursor-pointer group/link relative"
                        >
                          <span className="relative">
                            {feature.name}
                            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 transition-all duration-300 group-hover/link:w-full"></span>
                          </span>
                          <svg className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/link:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      ) : (
                        <span className="block md:inline">{feature.name}</span>
                      )}
                    </td>
                    {comparisonData.competitors.map((competitor) => {
                      const value = feature.values[competitor.key as keyof typeof feature.values];
                      return (
                        <td
                          key={competitor.key}
                          className={`px-2 md:px-4 py-3 md:py-4 text-center ${
                            competitor.highlight
                              ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-l-2 border-gradient-to-b from-blue-500 to-purple-500'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-bold ${
                                value.status
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40 animate-check-pulse'
                                  : 'bg-gray-800 border border-gray-700 text-gray-500'
                              }`}
                            >
                              {value.status ? '✓' : '−'}
                            </span>
                            <div
                              className={`mt-1 text-[10px] md:text-xs ${
                                value.status && competitor.highlight
                                  ? 'font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'
                                  : 'text-gray-400'
                              }`}
                            >
                              {value.value}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 md:mt-12">
          {comparisonData.stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 text-center hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes check-pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% { 
            transform: scale(1.1); 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          }
        }

        @keyframes fade-in-row {
          to {
            opacity: 1;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-check-pulse {
          animation: check-pulse 2s ease-in-out infinite;
        }

        .animate-fade-in-row {
          animation: fade-in-row 0.5s ease-out forwards;
        }

        tbody tr.visible {
          opacity: 1;
        }

        /* Custom scrollbar for the table */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }

        /* Mobile specific optimizations */
        @media (max-width: 768px) {
          .comparison-section {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          table {
            font-size: 0.75rem;
          }

          th, td {
            padding: 0.5rem 0.25rem;
          }

          .sticky {
            position: sticky;
            left: 0;
            z-index: 10;
          }

          /* Ensure the feature column doesn't get too narrow */
          th:first-child,
          td:first-child {
            min-width: 100px;
            max-width: 120px;
            word-wrap: break-word;
          }

          /* Make competitor columns narrower on mobile */
          th:not(:first-child),
          td:not(:first-child) {
            min-width: 60px;
          }
        }

        /* Gradient border effect */
        .border-gradient-to-b {
          border-image: linear-gradient(180deg, #3b82f6, #8b5cf6) 1;
        }
      `}</style>
    </div>
  );
};

export default ComparisonTable;