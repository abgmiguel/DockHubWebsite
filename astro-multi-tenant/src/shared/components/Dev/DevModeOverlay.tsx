import React, { useEffect, useState, useRef } from 'react';
import ComponentOverlay from './ComponentOverlay';
import JSONEditorModal from './JSONEditorModal';
import './DevModeOverlay.css';

interface ComponentInfo {
  id: string;
  name: string;
  dataPath?: string;
  element: HTMLElement;
  isReusable: boolean;
  isSelected?: boolean;  // For dashboard mode
  props?: any;
  order?: number;
  totalComponents?: number;
}

const DevModeOverlay: React.FC = () => {
  const [components, setComponents] = useState<Map<string, ComponentInfo>>(new Map());
  const [editingComponent, setEditingComponent] = useState<ComponentInfo | null>(null);
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  
  // Detect if we're in dashboard iframe mode (only on client side)
  const [isDashboardMode, setIsDashboardMode] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInIframe = window.parent !== window;
      setIsDashboardMode(isInIframe && new URLSearchParams(window.location.search).has('dashboardMode'));
    }
  }, []);

  // Add a visible indicator that the overlay is loaded
  useEffect(() => {
    console.log('[DevModeOverlay] Component mounted!');
    console.log('[DevModeOverlay] Environment:', { 
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      isDashboardMode 
    });
    
    // Listen for clear all selections from parent
    if (isDashboardMode && typeof window !== 'undefined') {
      const handleParentMessage = (event: MessageEvent) => {
        if (event.data.type === 'CLEAR_ALL_SELECTIONS') {
          setComponents(prev => {
            const newMap = new Map(prev);
            newMap.forEach((comp, key) => {
              comp.isSelected = false;
              newMap.set(key, { ...comp });
            });
            return newMap;
          });
        }
      };
      
      window.addEventListener('message', handleParentMessage);
      return () => window.removeEventListener('message', handleParentMessage);
    }
  }, [isDashboardMode]);

  useEffect(() => {
    console.log('[DevModeOverlay] Initializing...');
    
    // Function to scan for components with data attributes
    const scanForComponents = () => {
      console.log('[DevModeOverlay] Scanning for components...');
      const componentElements = document.querySelectorAll('[data-component-name]');
      const newComponents = new Map<string, ComponentInfo>();

      console.log(`[DevModeOverlay] Found ${componentElements.length} components`);
      
      componentElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          const id = element.getAttribute('data-component-id') || `comp-${Date.now()}-${Math.random()}`;
          const name = element.getAttribute('data-component-name') || 'Unknown Component';
          const dataPath = element.getAttribute('data-component-path') || undefined;
          const propsStr = element.getAttribute('data-component-props');
          const orderStr = element.getAttribute('data-component-order');
          
          console.log(`[DevModeOverlay] Processing component: ${name}, order: ${orderStr}`);
          
          let props = {};
          if (propsStr) {
            try {
              props = JSON.parse(propsStr);
            } catch (e) {
              console.error('Failed to parse component props:', e);
            }
          }

          const order = orderStr !== null ? parseInt(orderStr) : undefined;

          newComponents.set(id, {
            id,
            name,
            dataPath,
            element,
            isReusable: false,
            isSelected: false,
            props,
            order,
            totalComponents: componentElements.length
          });
        }
      });

      console.log(`[DevModeOverlay] Registered ${newComponents.size} components`);
      setComponents(newComponents);
    };

    // Initial scan
    scanForComponents();

    // Set up MutationObserver to watch for new components
    observerRef.current = new MutationObserver((mutations) => {
      let shouldRescan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                (node.hasAttribute('data-component-name') || 
                 node.querySelector('[data-component-name]'))) {
              shouldRescan = true;
            }
          });
        }
        
        if (mutation.type === 'attributes' && 
            mutation.attributeName?.startsWith('data-component-')) {
          shouldRescan = true;
        }
      });

      if (shouldRescan) {
        scanForComponents();
      }
    });

    // Start observing
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-component-name', 'data-component-id', 'data-component-path', 'data-component-props']
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleToggleReusable = (componentId: string) => {
    const component = components.get(componentId);
    if (!component) return;
    
    // In dashboard mode, send selection to parent
    if (isDashboardMode) {
      const newSelected = !component.isSelected;
      
      // Update local state
      setComponents(prev => {
        const newMap = new Map(prev);
        const comp = newMap.get(componentId);
        if (comp) {
          comp.isSelected = newSelected;
          newMap.set(componentId, { ...comp });
        }
        return newMap;
      });
      
      // Get current site name
      let site = window.location.hostname;
      if (site.includes('.localhost')) {
        site = site.replace('.localhost', '.com');
      } else if (site === 'localhost' || site === '127.0.0.1') {
        // Determine from port
        const port = window.location.port;
        if (port === '3002') site = 'darkflows.com';
        else if (port === '3003') site = 'prestongarrison.com';
        else if (port === '3004') site = 'codersinflow.com';
        else site = 'prestongarrison.com';
      }
      
      // Send message to parent frame
      window.parent.postMessage({
        type: newSelected ? 'COMPONENT_SELECTED' : 'COMPONENT_DESELECTED',
        component: {
          id: componentId,
          name: component.name,
          path: component.dataPath || 'unknown.json',
          site: site
        }
      }, '*');
    } else {
      // Original behavior for normal mode
      setComponents(prev => {
        const newMap = new Map(prev);
        const comp = newMap.get(componentId);
        if (comp) {
          comp.isReusable = !comp.isReusable;
          newMap.set(componentId, { ...comp });
        }
        return newMap;
      });
    }
  };

  const handleEditJson = async (component: ComponentInfo) => {
    // Try to load the actual JSON data
    if (component.dataPath) {
      try {
        // Extract site from hostname or query params
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        
        let site = '';
        if (tenantParam) {
          site = tenantParam;
        } else {
          site = window.location.hostname;
          if (site.includes('.localhost')) {
            site = site.replace('.localhost', '.com');
          } else if (site === 'localhost' || site === '127.0.0.1') {
            // Try to get from environment
            const siteEnv = import.meta.env.PUBLIC_SITE || import.meta.env.SITE;
            if (!siteEnv) {
              console.error('Cannot determine site: no SITE environment variable and running on localhost');
              component.props = {};
              setEditingComponent(component);
              setJsonEditorOpen(true);
              return;
            }
            site = siteEnv;
          }
        }
        
        // Check if dataPath includes array index notation
        const arrayMatch = component.dataPath.match(/^(.+\.json)\[(\d+)\]$/);
        let pathToLoad = component.dataPath;
        let arrayIndex = -1;
        
        if (arrayMatch) {
          pathToLoad = arrayMatch[1]; // e.g., "projects-items.json"
          arrayIndex = parseInt(arrayMatch[2]); // e.g., 0
        }
        
        // Use the Go API server to fetch the JSON data
        // API URL from environment or fallback to configured values
        const apiBase = import.meta.env.PUBLIC_API_URL || 
                       (import.meta.env.DEV 
                         ? `http://localhost:${import.meta.env.PUBLIC_DEV_API_PORT || '3001'}` 
                         : '');
        
        const response = await fetch(`${apiBase}/api/component-data?path=${pathToLoad}&site=${site}`);
        if (response.ok) {
          const data = await response.json();
          // If it's an array access, get the specific item
          if (arrayIndex >= 0 && Array.isArray(data)) {
            component.props = data[arrayIndex] || {};
          } else {
            component.props = data;
          }
        } else {
          const errorMsg = `API returned ${response.status}: ${response.statusText}`;
          console.error('Failed to load JSON data:', errorMsg);
          alert(`Failed to load JSON data from API server:\n${errorMsg}\n\nMake sure the API server is running.`);
          component.props = {};
        }
      } catch (error) {
        console.error('Failed to load JSON data:', error);
        alert(`Cannot connect to API server at ${apiBase}\n\nError: ${error.message}\n\nMake sure the API server is running with:\nnpm run api`);
        component.props = {};
      }
    }
    
    setEditingComponent(component);
    setJsonEditorOpen(true);
  };

  const handleMoveComponent = async (componentId: string, direction: 'up' | 'down') => {
    const component = components.get(componentId);
    if (!component || component.order === undefined) return;

    const currentOrder = component.order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find the component to swap with
    let swapComponent: ComponentInfo | undefined;
    components.forEach(comp => {
      if (comp.order === newOrder) {
        swapComponent = comp;
      }
    });

    if (!swapComponent) return;

    try {
      // Send reorder request to API
      const apiBase = import.meta.env.PUBLIC_API_URL || 
                     (import.meta.env.DEV 
                       ? `http://localhost:${import.meta.env.PUBLIC_DEV_API_PORT || '3001'}` 
                       : '');
      
      let site = window.location.hostname;
      if (site.includes('.localhost')) {
        site = site.replace('.localhost', '.com');
      } else if (site === 'localhost' || site === '127.0.0.1') {
        // Try to get from environment
        const siteEnv = import.meta.env.PUBLIC_SITE || import.meta.env.SITE;
        if (!siteEnv) {
          console.error('Cannot determine site for reordering: no SITE environment variable');
          return;
        }
        site = siteEnv;
      }

      const response = await fetch(`${apiBase}/api/reorder-components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site,
          component1: {
            name: component.name,
            order: currentOrder
          },
          component2: {
            name: swapComponent.name,
            order: newOrder
          },
          pagePath: window.location.pathname
        })
      });

      if (response.ok) {
        // In dashboard mode, just show success message instead of reloading
        if (isDashboardMode) {
          console.log('Components reordered successfully. Refresh to see changes.');
          // Could update local state to reflect new order without reload
          // For now, just log success
        } else {
          // Reload page to see changes (only when not in dashboard)
          window.location.reload();
        }
      } else {
        console.error('Failed to reorder components');
        alert('Failed to reorder components. This feature requires backend implementation.');
      }
    } catch (error) {
      console.error('Error reordering components:', error);
      alert('Component reordering requires backend implementation to modify .astro files.');
    }
  };

  const handleSaveJson = async (componentId: string, newData: any) => {
    const component = components.get(componentId);
    if (!component || !component.dataPath) return;

    try {
      // Send update to Go API server
      const apiBase = import.meta.env.PUBLIC_API_URL || 
                     (import.meta.env.DEV 
                       ? `http://localhost:${import.meta.env.PUBLIC_DEV_API_PORT || '3001'}` 
                       : '');
      
      // Extract site from hostname (e.g., prestongarrison.localhost -> prestongarrison.com)
      let site = window.location.hostname;
      if (site.includes('.localhost')) {
        site = site.replace('.localhost', '.com');
      } else if (site === 'localhost' || site === '127.0.0.1') {
        site = 'prestongarrison.com'; // Default for direct localhost access
      }
      
      const response = await fetch(`${apiBase}/api/component-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: component.dataPath,
          site: site,
          data: newData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update component data');
      }

      // Update local state
      setComponents(prev => {
        const newMap = new Map(prev);
        const comp = newMap.get(componentId);
        if (comp) {
          comp.props = newData;
          newMap.set(componentId, { ...comp });
        }
        return newMap;
      });

      // Trigger page reload to see changes (HMR should handle this in dev)
      window.location.reload();
    } catch (error) {
      console.error('Error saving JSON:', error);
      alert('Failed to save changes. Check console for details.');
    }
  };

  // Only show overlay when in dashboard mode
  if (!isDashboardMode) {
    return null;
  }

  return (
    <>
      {/* Debug indicator */}
      {import.meta.env.DEV && (
        <div 
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 99999,
            pointerEvents: 'none'
          }}
        >
          Dev Mode: {components.size} components tracked
        </div>
      )}
      
      {Array.from(components.values()).map((component) => (
        <ComponentOverlay
          key={component.id}
          component={component}
          onToggleReusable={() => handleToggleReusable(component.id)}
          onEditJson={() => handleEditJson(component)}
          onMoveUp={() => handleMoveComponent(component.id, 'up')}
          onMoveDown={() => handleMoveComponent(component.id, 'down')}
        />
      ))}
      
      {jsonEditorOpen && editingComponent && (
        <JSONEditorModal
          component={editingComponent}
          isOpen={jsonEditorOpen}
          onClose={() => {
            setJsonEditorOpen(false);
            setEditingComponent(null);
          }}
          onSave={(data) => handleSaveJson(editingComponent.id, data)}
        />
      )}
    </>
  );
};

export default DevModeOverlay;