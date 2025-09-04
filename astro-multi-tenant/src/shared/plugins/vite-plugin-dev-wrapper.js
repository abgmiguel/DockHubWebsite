// Vite plugin to automatically wrap components with DevWrapper in development
export function devWrapperPlugin() {
  console.log('DevWrapper plugin initialized!');
  return {
    name: 'dev-wrapper',
    enforce: 'pre',
    transform(code, id) {
      // Note: In Vite/Astro context, we're always in dev mode when this runs
      // The plugin itself is conditionally loaded in astro.config.mjs

      // Only process Astro files in the sites directory
      if (!id.endsWith('.astro') || !id.includes('/sites/')) {
        return code;
      }
      
      console.log('Processing file:', id);
      
      // Check if DevWrapper is already imported or used
      const hasDevWrapper = code.includes('DevWrapper');
      if (hasDevWrapper) {
        console.log('  -> Already has DevWrapper, skipping');
        return code; // Already using DevWrapper, skip
      }

      // Log first 500 chars to see what we're dealing with
      console.log('  -> First 200 chars:', code.substring(0, 200));

      let modifiedCode = code;
      let needsImport = false;

      // Find all components that have props coming from imported JSON data
      // Look for patterns like:
      // - data={someData}
      // - header={someData.header}
      // - items={someData.items}
      // - contactData={contactData}
      // etc.
      
      // Pattern to match components with props that look like JSON data
      // Now includes projectItems, experienceItems, headerData, skillsData, contactData
      const componentPattern = /<(\w+)([^>]*(?:data|Data|header|Header|items|Items|config|Config|projectItems|experienceItems|headerData|skillsData|contactData)=\{[^}]+\}[^>]*)\/>/g;
      const componentWithChildrenPattern = /<(\w+)([^>]*(?:data|Data|header|Header|items|Items|config|Config|projectItems|experienceItems|headerData|skillsData|contactData)=\{[^}]+\}[^>]*)>([\s\S]*?)<\/\1>/g;
      
      // Extract the data prop name from the component props
      function extractDataProp(componentName, propsString) {
        // Find ALL data-related props
        const propMatches = propsString.matchAll(/(\w+)=\{([^}]+)\}/g);
        const dataFiles = [];
        
        for (const match of propMatches) {
          const propName = match[1];
          const propValue = match[2].trim();
          
          // Skip non-data props
          if (propName === 'client') continue;
          
          // Map prop values to their JSON file names
          if (propValue.includes('Data') || propValue.includes('data')) {
            // Convert variable name to file name
            // heroData -> hero.json
            // projectsHeaderData -> projects-header.json
            // projectsItemsData -> projects-items.json
            const fileName = propValue
              .replace(/Data$/, '')
              .replace(/([A-Z])/g, '-$1')
              .toLowerCase()
              .replace(/^-/, '')
              .replace(/-$/, '') + '.json';
            
            dataFiles.push(fileName);
          }
        }
        
        // Return the first data file found (for simplicity)
        // In a real scenario, we might want to handle multiple data sources
        return dataFiles[0] || null;
      }

      // Process self-closing components
      modifiedCode = modifiedCode.replace(componentPattern, (match, componentName, props) => {
        console.log('Found component:', componentName, 'with props:', props);
        const dataPath = extractDataProp(componentName, props);
        console.log('Extracted dataPath:', dataPath);
        if (dataPath) {
          needsImport = true;
          const componentId = componentName.toLowerCase() + '-' + Date.now();
          return `<DevWrapper componentName="${componentName}" dataPath="${dataPath}" componentId="${componentId}">
  <${componentName}${props} />
</DevWrapper>`;
        }
        return match;
      });

      // Process components with children
      modifiedCode = modifiedCode.replace(componentWithChildrenPattern, (match, componentName, props, children) => {
        const dataPath = extractDataProp(componentName, props);
        if (dataPath) {
          needsImport = true;
          const componentId = componentName.toLowerCase() + '-' + Date.now();
          return `<DevWrapper componentName="${componentName}" dataPath="${dataPath}" componentId="${componentId}">
  <${componentName}${props}>${children}</${componentName}>
</DevWrapper>`;
        }
        return match;
      });

      // Add import if we wrapped anything
      if (needsImport) {
        // Find where imports end (after the --- block)
        const importInsertPoint = modifiedCode.indexOf('---', 3);
        if (importInsertPoint > -1) {
          const beforeImport = modifiedCode.slice(0, importInsertPoint);
          const afterImport = modifiedCode.slice(importInsertPoint);
          modifiedCode = beforeImport + 
            `import DevWrapper from '../../../shared/components/Dev/DevWrapper.astro';\n` +
            afterImport;
        }
      }

      return modifiedCode;
    }
  };
}