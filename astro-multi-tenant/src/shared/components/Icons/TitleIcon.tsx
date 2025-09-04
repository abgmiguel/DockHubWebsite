import React from 'react';

interface TitleIconProps {
  title: string;
}

const TitleIcon: React.FC<TitleIconProps> = ({ title }) => {
  if (title === "Any models") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    );
  } else if (title === "Any context") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    );
  } else if (title === "Any blocks") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      </svg>
    );
  } else if (title === "Any integrations") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22v-5M9 8V3m6 5V3M5 12H2m20 0h-3M7.05 19.07l-2.12 2.12M19.07 7.05l-2.12 2.12m0 9.9l2.12 2.12M7.05 5.05l-2.12-2.12" />
      </svg>
    );
  } else if (title === "Any workflows") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
        <path d="M16 12l-4 4-4-4m4 4V8" />
      </svg>
    );
  } else {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      </svg>
    );
  }
};

export default TitleIcon;
