// Astro integration that preprocesses .astro files before compilation
import fs from 'fs/promises';
import path from 'path';

export function astroAutoWrapper() {
  // Store original file contents to restore them later
  const originalFiles = new Map();
  
  return {
    name: 'astro-auto-wrapper',
    hooks: {
      'astro:config:setup': ({ updateConfig, command }) => {
        if (command === 'build' || command === 'dev') {
          updateConfig({
            vite: {
              plugins: [{
                name: 'astro-wrapper-transform',
                enforce: 'pre',
                
                async load(id) {
                  // Helper function to inject DevModeOverlay into layout files
                  const injectDevModeOverlay = (content) => {
                    // Find the frontmatter section
                    const frontmatterEnd = content.indexOf('---', 3);
                    if (frontmatterEnd === -1) {
                      return null;
                    }
                    
                    let frontmatter = content.substring(0, frontmatterEnd + 3);
                    let template = content.substring(frontmatterEnd + 3);
                    
                    // Add DevModeOverlay import after first ---
                    frontmatter = frontmatter.replace(
                      /^---\n/,
                      `---\nimport DevModeOverlay from '../../shared/components/Dev/DevModeOverlay.tsx';\n`
                    );
                    
                    // Add isDevelopment check before closing ---
                    if (!content.includes('isDevelopment')) {
                      frontmatter = frontmatter.replace(
                        /\n---$/,
                        `\n\n// Check if we're in development mode\nconst isDevelopment = import.meta.env.DEV;\n---`
                      );
                    }
                    
                    // Add DevModeOverlay before closing </body>
                    template = template.replace(
                      /<\/body>/,
                      `    {isDevelopment && <DevModeOverlay client:load />}\n  </body>`
                    );
                    
                    console.log('  -> Injected DevModeOverlay into layout');
                    return frontmatter + template;
                  };

                  // Only process .astro files in sites directories (pages and layout)
                  // Only process .astro files in sites directories (pages and layout)
                  if (!id.endsWith('.astro') || !id.includes('/sites/')) {
                    return null;
                  }
                  
                  // Only process pages and layout files
                  const isPageFile = id.includes('/pages/');
                  const isLayoutFile = id.endsWith('/layout.astro');
                  if (!isPageFile && !isLayoutFile) {
                    return null;
                  }
                  
                  // Read the file content
                  let content = await fs.readFile(id, 'utf-8');
                  let wasModified = false;
                  
                  // For layout files, inject DevModeOverlay if not present
                  if (isLayoutFile && !content.includes('DevModeOverlay')) {
                    content = injectDevModeOverlay(content);
                    wasModified = true;
                    // Continue processing to wrap components
                  }
                  
                  // Skip files that already have DevWrapper
                  if (content.includes('DevWrapper')) {
                    // If we already injected DevModeOverlay, return the modified content
                    return wasModified ? content : null;
                  }
                  
                  const fileName = path.basename(id);
                  console.log('Processing for wrapping:', fileName);
                  
                  // Check if this file imports components and JSON data
                  const hasComponentImports = /import\s+\w+\s+from\s+['"].*\/components\//.test(content);
                  const hasDataImports = /import\s+\w+\s+from\s+['"].*\.json['"]/.test(content);
                  
                  if (!hasComponentImports || !hasDataImports) {
                    // If we modified the content earlier (e.g., added DevModeOverlay), return it
                    return wasModified ? content : null;
                  }
                  
                  // Find the frontmatter section (re-parse after potential DevModeOverlay injection)
                  const frontmatterEnd = content.indexOf('---', 3);
                  if (frontmatterEnd === -1) {
                    return wasModified ? content : null;
                  }
                  
                  const frontmatter = content.substring(0, frontmatterEnd + 3);
                  const template = content.substring(frontmatterEnd + 3);
                  
                  // Parse imports to build a map of variable names to file paths
                  const importMap = {};
                  const importPattern = /import\s+(\w+)\s+from\s+['"]([^'"]+\.json)['"]/g;
                  let importMatch;
                  while ((importMatch = importPattern.exec(content)) !== null) {
                    const varName = importMatch[1];
                    const filePath = importMatch[2];
                    // Extract just the filename from the path
                    const fileName = filePath.split('/').pop();
                    importMap[varName] = fileName;
                  }
                  
                  // Pattern to match components with any prop that receives imported data
                  // Only match components starting with uppercase (React/Astro components, not HTML elements)
                  const componentPattern = /<([A-Z]\w+)\s+([^>]*\w+=\{[^}]+\}[^>]*)(\/>|>[\s\S]*?<\/\1>)/g;
                  
                  let modifiedTemplate = template;
                  let needsImport = false;
                  const wrappedComponents = [];
                  let componentOrder = 0;
                  
                  modifiedTemplate = modifiedTemplate.replace(componentPattern, (match, componentName, props, closing, offset, str) => {
                    // Check if this component is inside a JSX expression (like {showHeader && ...})
                    // Look for an unclosed { before this component
                    const beforeMatch = str.substring(0, offset);
                    const lastOpenBrace = beforeMatch.lastIndexOf('{');
                    const lastCloseBrace = beforeMatch.lastIndexOf('}');
                    
                    // If there's an unclosed { before this component, don't wrap it
                    if (lastOpenBrace > lastCloseBrace) {
                      return match;
                    }
                    // Extract data file name from props
                    const propMatches = [...props.matchAll(/(\w+)=\{([^}]+)\}/g)];
                    let dataFile = null;
                    
                    for (const [, propName, propValue] of propMatches) {
                      // Skip non-data props
                      if (propName === 'class' || propName === 'className' || propName === 'id' || propName === 'client') continue;
                      
                      // Check if the prop value looks like imported JSON data
                      const trimmedValue = propValue.trim();
                      
                      // First check if we have this variable in our import map
                      if (importMap[trimmedValue]) {
                        dataFile = importMap[trimmedValue];
                        break;
                      }
                      
                      // Fallback: guess based on variable name pattern
                      if (trimmedValue.match(/Data$|data/i) && !trimmedValue.startsWith('"') && !trimmedValue.startsWith("'")) {
                        // Convert variable name to likely filename
                        const fileName = trimmedValue
                          .replace(/Data$/, '')
                          .replace(/([A-Z])/g, '-$1')
                          .toLowerCase()
                          .replace(/^-/, '') + '.json';
                        
                        dataFile = fileName;
                        break;
                      }
                    }
                    
                    if (dataFile) {
                      needsImport = true;
                      const componentId = `${componentName.toLowerCase()}-auto`;
                      wrappedComponents.push(componentName);
                      
                      console.log(`  -> Wrapping ${componentName} with dataPath: ${dataFile}, order: ${componentOrder}`);
                      
                      // Wrap with DevWrapper including order
                      const orderAttr = `order={${componentOrder}}`;
                      componentOrder++;
                      
                      if (closing === '/>') {
                        return `<DevWrapper componentName="${componentName}" dataPath="${dataFile}" componentId="${componentId}" ${orderAttr}>
  <${componentName} ${props}/>
</DevWrapper>`;
                      } else {
                        const innerContent = closing.substring(1, closing.lastIndexOf(`</${componentName}>`));
                        return `<DevWrapper componentName="${componentName}" dataPath="${dataFile}" componentId="${componentId}" ${orderAttr}>
  <${componentName} ${props}>${innerContent}</${componentName}>
</DevWrapper>`;
                      }
                    }
                    
                    return match;
                  });
                  
                  if (needsImport) {
                    console.log(`  -> Wrapped components: ${wrappedComponents.join(', ')}`);
                    
                    // Determine correct import path based on file location
                    const isLayoutFile = id.endsWith('/layout.astro');
                    const importPath = isLayoutFile 
                      ? '../../shared/components/Dev/DevWrapper.astro'
                      : '../../../shared/components/Dev/DevWrapper.astro';
                    
                    // Add DevWrapper import at the top of the frontmatter
                    const importStatement = `import DevWrapper from '${importPath}';`;
                    const modifiedFrontmatter = frontmatter.replace(
                      /^---\n/,
                      `---\n${importStatement}\n`
                    );
                    
                    // Return the modified content
                    return modifiedFrontmatter + modifiedTemplate;
                  }
                  
                  // If we modified the content earlier (e.g., added DevModeOverlay), return it
                  return wasModified ? content : null;
                }
              }]
            }
          });
        }
      }
    }
  };
}