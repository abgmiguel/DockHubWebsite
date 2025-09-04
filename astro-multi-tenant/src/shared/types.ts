// Common types for shared components

export interface BaseComponentProps {
  className?: string;
  id?: string;
  data?: any;
}

export interface HeroData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButton?: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  image?: string;
  backgroundImage?: string;
}

export interface FeatureData {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link?: {
    text: string;
    href: string;
  };
  features?: string[];
  highlighted?: boolean;
}

export interface TestimonialData {
  id?: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  image?: string;
  date?: string;
}

export interface CTAData {
  title: string;
  subtitle?: string;
  description?: string;
  primaryButton?: {
    text: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

export interface ComparisonData {
  title?: string;
  subtitle?: string;
  items: Array<{
    feature: string;
    us: boolean | string;
    them: boolean | string;
  }>;
}

export interface VideoData {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  duration?: string;
  views?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  badge?: string;
  subItems?: NavigationItem[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon?: string;
}