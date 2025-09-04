// Astro integration for automatically wrapping components with DevWrapper
export function autoWrapperIntegration() {
  return {
    name: 'auto-wrapper-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [{
              name: 'component-auto-wrapper',
              enforce: 'pre', // Run before Astro processes the files
              
              async transform(code, id) {
                // Only process .astro files in sites directory pages
                if (!id.endsWith('.astro') || !id.includes('/sites/') || !id.includes('/pages/')) {
                  return;
                }
                
                // Skip if already has DevWrapper
                if (code.includes('DevWrapper')) {
                  return;
                }
                
                const fileName = id.split('/').pop();
                console.log('Auto-wrapper checking:', fileName);
                

                
                // Check if this is an Astro file with component imports and data props
                const hasComponentImports = /import\s+\w+\s+from\s+['"].*\/components\//.test(code);
                const hasDataImports = /import\s+\w+\s+from\s+['"].*\.json['"]/.test(code);
                
                if (!hasComponentImports || !hasDataImports) {
                  console.log('  -> Skipping: no component imports or JSON data');
                  return;
                }
                
                // Find the frontmatter section
                const frontmatterMatch = code.match(/^(---\n[\s\S]*?\n---)/);
                if (!frontmatterMatch) {
                  return;
                }
                
                const frontmatter = frontmatterMatch[1];
                const template = code.slice(frontmatter.length);
                
                // Find components that receive JSON data props
                // Match patterns like:
                // <Hero data={heroData} />
                // <Projects projectItems={projectsItemsData} header={projectsHeaderData} />
                // <Qualifications headerData={qualificationsHeaderData} skillsData={skillsData} />
                
                const componentPattern = /<(\w+)\s+([^>]*(?:data|Data|header|Header|items|Items|config|Config|projectItems|experienceItems|headerData|skillsData|contactData)=\{[^}]+\}[^>]*)(\/>|>[\s\S]*?<\/\1>)/g;
                
                let modifiedTemplate = template;
                let needsImport = false;
                const wrappedComponents = [];
                
                modifiedTemplate = modifiedTemplate.replace(componentPattern, (match, componentName, props, closing) => {
                  // Extract data prop references
                  const propMatches = [...props.matchAll(/(\w+)=\{([^}]+)\}/g)];
                  let dataFile = null;
                  
                  for (const [, propName, propValue] of propMatches) {
                    // Skip non-data props
                    if (propName === 'client' || propName === 'class' || propName === 'className') continue;
                    
                    // Check if the prop value looks like imported data
                    if (propValue.includes('Data') || propValue.includes('data')) {
                      // Convert to filename: heroData -> hero.json, projectsHeaderData -> projects-header.json
                      const fileName = propValue.trim()
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
                    const componentId = `${componentName.toLowerCase()}-${Date.now()}`;
                    wrappedComponents.push(componentName);
                    
                    // Wrap with DevWrapper
                    if (closing === '/>') {
                      // Self-closing component
                      return `<DevWrapper componentName="${componentName}" dataPath="${dataFile}" componentId="${componentId}">
  <${componentName} ${props}/>
</DevWrapper>`;
                    } else {
                      // Component with children
                      const content = closing.replace(`</${componentName}>`, '');
                      return `<DevWrapper componentName="${componentName}" dataPath="${dataFile}" componentId="${componentId}">
  <${componentName} ${props}${content}</${componentName}>
</DevWrapper>`;
                    }
                  }
                  
                  return match;
                });
                
                if (needsImport) {
                  console.log(`  -> Auto-wrapping components: ${wrappedComponents.join(', ')}`);
                  
                  // Add DevWrapper import to frontmatter
                  const importStatement = `import DevWrapper from '../../../shared/components/Dev/DevWrapper.astro';`;
                  
                  // Insert the import after the other imports in frontmatter
                  const modifiedFrontmatter = frontmatter.replace(
                    /(\n---)/,
                    `\n${importStatement}\n$1`
                  );
                  
                  return modifiedFrontmatter + modifiedTemplate;
                }
                
                return code;
              }
            }]
          }
        });
      }
    }
  };
}