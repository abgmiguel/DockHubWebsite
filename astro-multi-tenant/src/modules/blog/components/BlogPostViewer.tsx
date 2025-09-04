import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import { common, createLowlight } from 'lowlight';
import 'highlight.js/styles/github-dark.css';
import './viewer-styles.css';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostViewerProps {
  post: {
    id: string;
    title: string;
    content: string;
    category_data?: { name: string; slug: string } | null;
    coverImage?: string;
    author_data: {
      name: string;
      email: string;
    } | null;
    readingTime: number;
    createdAt: string;
  };
}

export default function BlogPostViewer({ post }: BlogPostViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
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
        openOnClick: true,
        HTMLAttributes: {
          class: 'blog-link underline',
          rel: 'noopener noreferrer',
          target: '_blank'
        },
      }),
      Youtube.configure({
        inline: false,
        width: 800,
        height: 450,
        HTMLAttributes: {
          class: 'my-8 mx-auto rounded-lg w-full max-w-[800px]',
        },
      }),
    ],
    content: isMounted && post?.content ? (() => {
      try {
        if (post.content && post.content.trim()) {
          return typeof post.content === 'string' ? JSON.parse(post.content) : post.content;
        }
        return '';
      } catch (e) {
        console.error('Failed to parse content:', e);
        return '';
      }
    })() : '',
    editable: false, // Read-only mode
    editorProps: {
      attributes: {
        class: 'max-w-none w-full focus:outline-none',
      },
    },
  }, [post?.content, isMounted]);

  // Generate TOC from editor content
  useEffect(() => {
    if (!editor) return;
    
    const generateToc = () => {
      const headings: TocItem[] = [];
      const doc = editor.state.doc;
      
      doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level;
          const text = node.textContent;
          const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
          
          headings.push({ id, text, level });
        }
      });
      
      setToc(headings);
    };
    
    generateToc();
    
    // Also update IDs in the DOM
    setTimeout(() => {
      const headingElements = document.querySelectorAll('.blog-post-content-medium h1, .blog-post-content-medium h2, .blog-post-content-medium h3');
      headingElements.forEach((heading, index) => {
        const text = heading.textContent || '';
        const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
        heading.id = id;
      });
    }, 100);
    
  }, [editor, post?.content]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  if (!isMounted || !editor) {
    return (
      <div className="min-h-[400px] p-4 blog-text-muted">
        Loading...
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full">
      {/* Centered container with responsive padding */}
      <div className="max-w-[840px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <article className="py-8">
          {/* Post Header */}
          <header className="mb-12">
            {/* Title - Large serif font like Medium */}
            <h1 className="text-[42px] leading-[1.2] font-serif font-bold mb-4 blog-text-primary">
              {post.title}
            </h1>
            
            {/* Author info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-blog-author-avatar-bg flex items-center justify-center text-blog-author-avatar-text font-medium">
                {post.author_data?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium blog-text-primary text-base">
                    {post.author_data?.name || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm blog-text-secondary">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </div>
            
            {/* Cover Image if exists */}
            {post.coverImage && (
              <div className="mb-8 -mx-5">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}
          </header>

          {/* Post Content with Medium-style typography */}
          <div className="blog-post-content-medium">
            <EditorContent editor={editor} />
          </div>
        </article>
      </div>
      
      {/* Table of Contents - Fixed position on medium+ screens */}
      {toc.length > 0 && (
        <aside className="hidden lg:block fixed right-2 lg:right-4 xl:right-8 top-24 w-48 lg:w-56 xl:w-64">
          <div className="bg-blog-card-bg border border-blog-border rounded-lg p-4 lg:p-5 xl:p-6">
            <h3 className="text-xs font-semibold mb-3 lg:mb-4 blog-text-secondary uppercase tracking-wider">On this page</h3>
            <nav className="space-y-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block text-left w-full py-1 blog-text-muted hover:blog-text-primary transition-colors text-xs lg:text-sm ${
                    item.level === 1 ? 'font-medium' : 
                    item.level === 2 ? 'pl-3' : 
                    'pl-6'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}