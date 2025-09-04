// Convert TipTap JSON to HTML
export function tiptapJsonToHtml(json: string | object): string {
  try {
    const doc = typeof json === 'string' ? JSON.parse(json) : json;
    
    if (!doc || !doc.content) {
      return '';
    }
    
    return doc.content.map((node: any) => {
      switch (node.type) {
        case 'paragraph':
          if (!node.content || node.content.length === 0) {
            return '<p><br></p>';
          }
          const text = node.content.map((child: any) => {
            if (child.type === 'text') {
              let text = child.text;
              if (child.marks) {
                child.marks.forEach((mark: any) => {
                  switch (mark.type) {
                    case 'bold':
                      text = `<strong>${text}</strong>`;
                      break;
                    case 'italic':
                      text = `<em>${text}</em>`;
                      break;
                    case 'code':
                      text = `<code>${text}</code>`;
                      break;
                    case 'link':
                      text = `<a href="${mark.attrs.href}" target="_blank" rel="noopener">${text}</a>`;
                      break;
                  }
                });
              }
              return text;
            }
            return '';
          }).join('');
          return `<p>${text}</p>`;
          
        case 'heading':
          const level = node.attrs?.level || 1;
          const headingText = node.content?.map((child: any) => child.text || '').join('') || '';
          return `<h${level}>${headingText}</h${level}>`;
          
        case 'bulletList':
          const listItems = node.content?.map((item: any) => {
            const itemText = item.content?.map((p: any) => 
              p.content?.map((t: any) => t.text || '').join('') || ''
            ).join('') || '';
            return `<li>${itemText}</li>`;
          }).join('') || '';
          return `<ul>${listItems}</ul>`;
          
        case 'orderedList':
          const orderedItems = node.content?.map((item: any) => {
            const itemText = item.content?.map((p: any) => 
              p.content?.map((t: any) => t.text || '').join('') || ''
            ).join('') || '';
            return `<li>${itemText}</li>`;
          }).join('') || '';
          return `<ol>${orderedItems}</ol>`;
          
        case 'codeBlock':
          const code = node.content?.map((child: any) => child.text || '').join('') || '';
          const lang = node.attrs?.language || '';
          return `<pre><code class="language-${lang}">${code}</code></pre>`;
          
        case 'blockquote':
          const quoteContent = node.content?.map((p: any) => 
            `<p>${p.content?.map((t: any) => t.text || '').join('') || ''}</p>`
          ).join('') || '';
          return `<blockquote>${quoteContent}</blockquote>`;
          
        case 'horizontalRule':
          return '<hr>';
          
        default:
          return '';
      }
    }).join('');
  } catch (error) {
    console.error('Error parsing TipTap JSON:', error);
    return '';
  }
}