import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  delay?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            if (once) {
              observer.disconnect();
            }
          }, delay);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, once]);

  return (
    <div
      ref={ref}
      className={`${className} ${
        isVisible ? `animate-${animation}` : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

// Higher-order component for adding scroll animations to existing components
export const withScrollAnimation = <P extends object>(
  Component: React.ComponentType<P>,
  animationOptions?: Omit<ScrollAnimationProps, 'children'>
) => {
  return React.forwardRef<HTMLDivElement, P>((props, ref) => {
    return (
      <ScrollAnimation {...animationOptions}>
        <Component {...props} ref={ref} />
      </ScrollAnimation>
    );
  });
};

// Hook for manual control of scroll animations
export const useScrollAnimation = (options?: {
  threshold?: number;
  delay?: number;
  once?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            if (options?.once !== false) {
              observer.disconnect();
            }
          }, options?.delay || 0);
        } else if (options?.once === false) {
          setIsVisible(false);
        }
      },
      { threshold: options?.threshold || 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options?.delay, options?.threshold, options?.once]);

  return { ref, isVisible };
};

// Staggered animations for lists
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  animation?: ScrollAnimationProps['animation'];
  staggerDelay?: number;
  threshold?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  animation = 'fade-in-up',
  staggerDelay = 100,
  threshold = 0.1,
  className = ''
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <ScrollAnimation
          animation={animation}
          delay={index * staggerDelay}
          threshold={threshold}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  );
};