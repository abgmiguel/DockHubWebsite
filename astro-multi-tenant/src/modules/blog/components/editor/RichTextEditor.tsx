import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, ImageIcon, Code, Link2, Quote, Youtube as YoutubeIcon } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

// Import languages for syntax highlighting
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import ruby from 'highlight.js/lib/languages/ruby';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import shell from 'highlight.js/lib/languages/shell';
import plaintext from 'highlight.js/lib/languages/plaintext';

// Create lowlight instance
const lowlight = createLowlight(common);
lowlight.register('typescript', typescript);
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('java', java);
lowlight.register('bash', bash);
lowlight.register('json', json);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('shell', shell);
lowlight.register('plaintext', plaintext);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    // Set initial content in window object if it exists
    if (content && content.trim() && typeof window !== 'undefined') {
      (window as any).__editorContent = content;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'auto',
        HTMLAttributes: {
          class: 'hljs not-prose bg-[#0d1117] rounded-lg p-4 overflow-x-auto text-sm leading-relaxed',
          spellcheck: 'false',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-link hover:text-link-hover underline',
          rel: 'noopener noreferrer',
          target: '_blank'
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      Youtube.configure({
        inline: false,
        width: 800,
        height: 450,
        HTMLAttributes: {
          class: 'my-4 mx-auto rounded-lg w-full max-w-[800px]',
        },
      }),
    ],
    content: isMounted ? (() => {
      try {
        if (content && content.trim()) {
          return typeof content === 'string' ? JSON.parse(content) : content;
        }
        return '';
      } catch (e) {
        console.error('Failed to parse initial content:', e);
        return '';
      }
    })() : '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[400px] max-w-none w-full p-4 focus:outline-none [&_li>p]:!m-0 [&_li>p]:!inline',
      },
      handlePaste: (view, event, slice) => {
        // Check for images in clipboard
        const items = event.clipboardData?.items;
        if (!items) return false;
        
        // Check if there's an image in the clipboard
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            
            const blob = item.getAsFile();
            if (!blob) continue;
            
            // Upload the pasted image asynchronously
            const uploadImage = async () => {
              try {
                const formData = new FormData();
                const extension = blob.type.split('/')[1] || 'png';
                const filename = `pasted-image-${Date.now()}.${extension}`;
                const file = new File([blob], filename, { type: blob.type });
                
                formData.append('file', file);

                // Use full API URL in development, relative in production
                const uploadUrl = import.meta.env.PUBLIC_API_URL 
                  ? `${import.meta.env.PUBLIC_API_URL}/api/upload`
                  : '/api/upload';
                
                const response = await fetch(uploadUrl, {
                  method: 'POST',
                  body: formData,
                  credentials: 'include',
                });

                if (response.ok) {
                  const { url } = await response.json();
                  // In development, prepend the API URL to the uploads path
                  const imageUrl = import.meta.env.PUBLIC_API_URL && url.startsWith('/uploads/')
                    ? `${import.meta.env.PUBLIC_API_URL}${url}`
                    : url;
                  view.dispatch(view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: imageUrl })
                  ));
                }
              } catch (error) {
                console.error('Upload error:', error);
              }
            };
            
            uploadImage();
            return true; // Prevent default paste behavior for images
          }
        }
        
        // Let TipTap handle text pastes normally
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const jsonString = JSON.stringify(json);
      
      // Store in window object for Astro to access
      if (typeof window !== 'undefined') {
        (window as any).__editorContent = jsonString;
      }
      
      // Call onChange
      if (onChange) {
        try {
          onChange(jsonString);
        } catch (error) {
          console.error('Error calling onChange:', error);
        }
      }
    },
    immediatelyRender: false,
    placeholder,
  });

  // Update content when it changes externally (like in reference implementation)
  useEffect(() => {
    if (editor && content && isMounted) {
      try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(parsedContent)) {
          editor.commands.setContent(parsedContent);
        }
      } catch (e) {
        console.error('Failed to sync content:', e);
      }
    }
  }, [content, editor, isMounted]);

  // Helper function to upload image (used by both file picker and paste)
  const uploadImage = useCallback(async (file: File | Blob, filename?: string) => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      // If it's a blob from paste, give it a proper filename
      if (file instanceof Blob && !(file instanceof File)) {
        const extension = file.type.split('/')[1] || 'png';
        filename = filename || `pasted-image-${Date.now()}.${extension}`;
        file = new File([file], filename, { type: file.type });
      }
      
      formData.append('file', file);

      // Use full API URL in development, relative in production (nginx will proxy)
      const uploadUrl = import.meta.env.PUBLIC_API_URL 
        ? `${import.meta.env.PUBLIC_API_URL}/api/upload`
        : '/api/upload';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        // Show more detailed error to user
        let errorMessage = 'Failed to upload image';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 413) {
          errorMessage = 'File too large. Maximum size is 10MB.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.';
        }
        alert(errorMessage + '\n\nDetails: ' + errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const { url } = await response.json();
      // In development, prepend the API URL to the uploads path
      // In production, nginx will serve /uploads/ directly
      const imageUrl = import.meta.env.PUBLIC_API_URL && url.startsWith('/uploads/')
        ? `${import.meta.env.PUBLIC_API_URL}${url}`
        : url;
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      return false;
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const addImage = useCallback(async () => {
    // Show paste dialog instead of immediately opening file picker
    setShowPasteDialog(true);
  }, []);

  // Function to select file from disk
  const selectFile = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setShowPasteDialog(false);
      await uploadImage(file);
    };
    
    input.click();
  }, [uploadImage]);
  
  // Handle paste in dialog
  const handleDialogPaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        const blob = item.getAsFile();
        if (!blob) continue;
        
        setShowPasteDialog(false);
        await uploadImage(blob);
        return;
      }
    }
    
    alert('No image found in clipboard. Try copying an image first.');
  }, [uploadImage]);
  
  // Set up paste listener for dialog
  useEffect(() => {
    if (showPasteDialog) {
      const handlePaste = (e: ClipboardEvent) => handleDialogPaste(e);
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [showPasteDialog, handleDialogPaste]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    // Cancel button or empty URL
    if (url === null) {
      return;
    }

    // Remove link if URL is empty
    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL (including http:// or https://)');
      return;
    }

    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  // Helper to check if text is selected
  const hasTextSelection = useCallback(() => {
    return editor?.state.selection.content().size ?? 0 > 0;
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-border rounded-lg bg-surface min-h-[400px] p-4 text-text-muted">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border bg-background p-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('bold') ? 'bg-surface text-text-primary' : ''}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('italic') ? 'bg-surface text-text-primary' : ''}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('heading', { level: 1 }) ? 'bg-surface text-text-primary' : ''}`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('heading', { level: 2 }) ? 'bg-surface text-text-primary' : ''}`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('heading', { level: 3 }) ? 'bg-surface text-text-primary' : ''}`}
              title="Heading 3"
            >
              H3
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('bulletList') ? 'bg-surface text-text-primary' : ''}`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('orderedList') ? 'bg-surface text-text-primary' : ''}`}
              title="Ordered List"
            >
              <ListOrdered size={16} />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('codeBlock') ? 'bg-surface text-text-primary' : ''}`}
              title="Code Block"
            >
              <Code size={16} />
            </button>
            
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary ${editor.isActive('blockquote') ? 'bg-surface text-text-primary' : ''}`}
              title="Quote"
            >
              <Quote size={16} />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button
              type="button"
              onClick={setLink}
              disabled={!hasTextSelection()}
              className={`p-2 rounded ${
                editor?.isActive('link') 
                  ? 'bg-surface text-text-primary' 
                  : hasTextSelection() 
                    ? 'hover:bg-surface text-text-secondary hover:text-text-primary' 
                    : 'opacity-50 cursor-not-allowed text-text-muted'
              }`}
              title={hasTextSelection() ? 'Add Link' : 'Select text to add link'}
            >
              <Link2 size={16} />
            </button>
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary relative"
              title="Add Image"
              disabled={uploading}
            >
              <ImageIcon size={16} className={uploading ? 'opacity-50' : ''} />
              {uploading && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-surface px-2 py-1 rounded text-xs whitespace-nowrap">
                  Uploading...
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt('Enter YouTube URL (youtube.com/watch?v=... or youtu.be/...)');
                if (url) {
                  editor.chain().focus().setYoutubeVideo({ src: url }).run();
                }
              }}
              className="p-2 rounded hover:bg-surface text-text-secondary hover:text-text-primary"
              title="Embed YouTube Video"
            >
              <YoutubeIcon size={16} />
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <EditorContent editor={editor} />
        
        {/* Paste Dialog */}
        {showPasteDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPasteDialog(false)}>
            <div 
              className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Add Image</h3>
              
              <div className="space-y-4">
                {/* Paste option */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <div className="mb-2">
                    <ImageIcon size={32} className="mx-auto text-text-muted" />
                  </div>
                  <p className="text-text-secondary mb-2">Paste an image from clipboard</p>
                  <p className="text-sm text-text-muted">Copy an image and press Ctrl+V / Cmd+V</p>
                </div>
                
                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-surface"></div>
                  <span className="text-text-muted text-sm">OR</span>
                  <div className="flex-1 h-px bg-surface"></div>
                </div>
                
                {/* File upload option */}
                <button
                  type="button"
                  onClick={selectFile}
                  className="w-full px-4 py-3 bg-surface hover:bg-surface-hover rounded-lg text-text-primary transition-colors"
                >
                  Select File from Computer
                </button>
                
                {/* Cancel button */}
                <button
                  type="button"
                  onClick={() => setShowPasteDialog(false)}
                  className="w-full px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-background rounded text-xs text-text-muted">
                <p className="mb-1">💡 Pro tip: You can also paste images directly in the editor!</p>
                <p>Just copy any image and paste it while typing.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}