import React from 'react';

/**
 * Wrapper component for individual items in collections
 * Adds dev mode tracking attributes to each item
 */
const DevItemWrapper = ({ 
  componentName, 
  itemId, 
  itemData, 
  dataPath,
  children 
}) => {
  // Only add wrapper in development mode
  if (import.meta.env.PROD) {
    return children;
  }

  const componentId = `${componentName}-${itemId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      data-component-id={componentId}
      data-component-name={componentName}
      data-component-path={dataPath}
      data-component-props={itemData ? JSON.stringify(itemData) : undefined}
      data-item-id={itemId}
      style={{ display: 'contents' }} // This makes the wrapper div not affect layout
    >
      {children}
    </div>
  );
};

export default DevItemWrapper;