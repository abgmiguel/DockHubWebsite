import React from 'react';

const DevComponentWrapper = ({ componentName, dataPath, componentId, data, children }) => {
  // Only add wrapper in development
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  return (
    <div 
      data-component-name={componentName}
      data-component-path={dataPath}
      data-component-id={componentId || `${componentName}-${Date.now()}`}
      data-component-props={data ? JSON.stringify(data) : undefined}
    >
      {children}
    </div>
  );
};

export default DevComponentWrapper;