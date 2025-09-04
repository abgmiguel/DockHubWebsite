import React, { useState, useEffect } from 'react';

interface ComponentInfo {
  id: string;
  name: string;
  dataPath?: string;
  element: HTMLElement;
  isReusable: boolean;
  props?: any;
}

interface JSONEditorModalProps {
  component: ComponentInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const JSONEditorModal: React.FC<JSONEditorModalProps> = ({
  component,
  isOpen,
  onClose,
  onSave
}) => {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen && component.props) {
      setJsonContent(JSON.stringify(component.props, null, 2));
      setError('');
      setIsDirty(false);
    }
  }, [isOpen, component]);

  const handleContentChange = (value: string) => {
    console.log('[JSONEditor] Content changed, setting isDirty to true');
    setJsonContent(value);
    setIsDirty(true);
    
    // Validate JSON
    try {
      JSON.parse(value);
      setError('');
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(jsonContent);
      onSave(parsedData);
      setIsDirty(false);
      onClose();
    } catch (e) {
      setError(`Cannot save invalid JSON: ${e.message}`);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(`Cannot format invalid JSON: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="json-editor-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isDirty) {
            if (confirm('You have unsaved changes. Close anyway?')) {
              onClose();
            }
          } else {
            onClose();
          }
        }
      }}
    >
      <div
        className="json-editor-modal"
        style={{
          background: '#1f2937',
          borderRadius: '12px',
          padding: '20px',
          width: '95%',
          maxWidth: '1600px',
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      >
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2
            style={{
              margin: 0,
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: '#60a5fa' }}>Edit JSON:</span>
            <span>{component.name}</span>
            {isDirty && <span style={{ color: '#fbbf24', fontSize: '14px' }}>●</span>}
          </h2>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ×
          </button>
        </div>

        {component.dataPath && (
          <div
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '12px',
              fontFamily: 'monospace'
            }}
          >
            Path: {component.dataPath} | isDirty: {isDirty ? 'true' : 'false'}
          </div>
        )}

        <div
          className="editor-container"
          style={{
            flex: 1,
            marginBottom: '16px',
            position: 'relative',
            minHeight: '300px',
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          <textarea
            value={jsonContent}
            onChange={(e) => handleContentChange(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              background: '#111827',
              color: '#e5e7eb',
              border: error ? '1px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'none',
              outline: 'none',
              overflowY: 'auto',
              overflowX: 'auto'
            }}
            spellCheck={false}
          />
        </div>

        {error && (
          <div
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginBottom: '12px',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {error}
          </div>
        )}

        <div
          className="modal-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={handleFormat}
            disabled={!!error}
            style={{
              background: 'rgba(156, 163, 175, 0.1)',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              color: error ? '#6b7280' : '#d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: error ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: error ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!error) {
                e.currentTarget.style.background = 'rgba(156, 163, 175, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
            }}
          >
            Format JSON
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {component.dataPath && (
              <button
                onClick={() => {
                  // Get the current site from the SITE env variable or detect from URL
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
                        alert('Cannot determine which site you are editing. Please use npm run dev:[sitename]');
                        return;
                      }
                      site = siteEnv;
                    }
                  }
                  
                  // Remove array notation from path if present
                  const cleanPath = component.dataPath.replace(/\[\d+\]$/, '');
                  
                  // Construct the full file path
                  const fullPath = `/Users/prestongarrison/Source/codersinflow.com/astro-multi-tenant/src/sites/${site}/data/${cleanPath}`;
                  
                  console.log('Opening in VS Code:', fullPath);
                  
                  // Open in VS Code
                  window.location.href = `vscode://file${fullPath}`;
                }}
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#86efac',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                }}
              >
                Open in VS Code
              </button>
            )}
            
            <button
              onClick={onClose}
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.4)',
                color: '#d1d5db',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={!!error || !isDirty}
              style={{
                background: error || !isDirty ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: error || !isDirty ? '#6b7280' : '#93c5fd',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: error || !isDirty ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: error || !isDirty ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!error && isDirty) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.color = '#dbeafe';
                }
              }}
              onMouseLeave={(e) => {
                if (!error && isDirty) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.color = '#93c5fd';
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONEditorModal;