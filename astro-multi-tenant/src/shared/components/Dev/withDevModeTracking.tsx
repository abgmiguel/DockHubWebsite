import React from 'react';

interface WithDevModeOptions {
  componentName: string;
  dataPath?: string;
}

/**
 * HOC that wraps components with dev mode tracking attributes
 * This allows the DevModeOverlay to detect and track components
 */
export function withDevModeTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: WithDevModeOptions
) {
  // Only wrap in development mode
  if (import.meta.env.PROD) {
    return Component;
  }

  const WrappedComponent: React.FC<P> = (props) => {
    const componentId = React.useRef(`${options.componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    return (
      <div
        data-component-id={componentId.current}
        data-component-name={options.componentName}
        data-component-path={options.dataPath}
        data-component-props={JSON.stringify(props)}
        style={{ display: 'contents' }} // This makes the wrapper div not affect layout
      >
        <Component {...props} />
      </div>
    );
  };

  WrappedComponent.displayName = `WithDevModeTracking(${Component.displayName || Component.name || options.componentName})`;

  return WrappedComponent;
}

/**
 * Hook to add dev mode attributes directly to an element
 * Useful for Astro components or when you can't use the HOC
 */
export function useDevModeAttributes(
  componentName: string,
  dataPath?: string,
  props?: any
) {
  if (import.meta.env.PROD) {
    return {};
  }

  const componentId = React.useRef(`${componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  return {
    'data-component-id': componentId.current,
    'data-component-name': componentName,
    'data-component-path': dataPath,
    'data-component-props': props ? JSON.stringify(props) : undefined
  };
}