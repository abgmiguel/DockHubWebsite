# VSCode Extension Integration Plan

## Overview
Create a development dashboard that allows selecting components from the multi-tenant sites and sending them to the VSCode extension's message box.

## Architecture

### 1. Main Dashboard Page
**Location**: `/astro-multi-tenant/src/pages/index.astro` (root)

**Features**:
- Site selector dropdown (prestongarrison.com, darkflows.com, codersinflow.com)
- Iframe to display selected site
- Selected components list
- "Send to VSCode" button
- Component counter badge

**Layout**:
```
┌─────────────────────────────────────────────┐
│  [Site Selector ▼]  Selected: 3 components  │
│  [Send to VSCode]   [Clear Selection]       │
├─────────────────────────────────────────────┤
│                                             │
│            <iframe>                         │
│         (Selected site loads here)         │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Modified DevModeOverlay Behavior

**Detection Mode**:
```javascript
const isInIframe = window.parent !== window;
const isDashboardMode = isInIframe && window.parent.location.pathname === '/';
```

**Component Selection**:
- When in dashboard mode, checkboxes become "Select for VSCode"
- Selected components send message to parent frame
- Visual indicator (highlight) for selected components

**Communication**:
```javascript
// From iframe to parent
window.parent.postMessage({
  type: 'COMPONENT_SELECTED',
  component: {
    name: 'ProjectsHeader',
    path: 'projects-header.json',
    site: 'prestongarrison.com'
  }
}, '*');

// Parent listens and maintains state
const selectedComponents = new Set();
```

### 3. VSCode Message Integration

**Message Format**:
```
I want to use the following components on my site:

• ProjectsHeader (prestongarrison.com/data/projects-header.json)
• Hero (darkflows.com/data/hero.json)
• FeatureCarousel (darkflows.com/data/carousel.json)

Components selected from multi-tenant dashboard.
```

**Delivery Methods**:
1. **VSCode Command URI**: `vscode://command/codersinflow.sendMessage?args=["message"]`
2. **Copy to Clipboard**: Fallback that works everywhere
3. **HTTP POST**: Optional future enhancement

**Implementation Strategy**:
Using the existing domain-based messaging infrastructure:
- Add `fillChatInput` action to UICommandMessageService
- ChatPanel listens for `fillChatInput` command
- Calls `chatInputRef.current.setInputText(message)`

### 4. Implementation Steps

#### Phase 1: Dashboard Creation
- [ ] Create root index.astro with iframe structure
- [ ] Add site selector dropdown
- [ ] Style with Tailwind for clean UI
- [ ] Implement iframe loading with selected site

#### Phase 2: Component Selection
- [ ] Modify DevModeOverlay to detect iframe mode
- [ ] Change checkbox behavior in dashboard mode
- [ ] Implement postMessage communication
- [ ] Add visual selection indicators

#### Phase 3: State Management
- [ ] Parent frame maintains selected components Set
- [ ] Display selected count in badge
- [ ] Show selected components list
- [ ] Clear selection button

#### Phase 4: VSCode Integration
- [x] Format message with component list
- [x] Implement copy to clipboard
- [x] Add "Send to VSCode" button
- [x] Success/error feedback
- [ ] Add fillChatInput handler to UICommandMessageService
- [ ] Update ChatPanel to listen for fillChatInput command
- [ ] Modify codersinflow.sendMessage command

### 5. Code Examples

**Dashboard Controller** (parent frame):
```javascript
class DashboardController {
  constructor() {
    this.selectedComponents = new Map();
    this.currentSite = 'prestongarrison.com';
    
    window.addEventListener('message', (e) => {
      if (e.data.type === 'COMPONENT_SELECTED') {
        this.addComponent(e.data.component);
      } else if (e.data.type === 'COMPONENT_DESELECTED') {
        this.removeComponent(e.data.component);
      }
    });
  }
  
  sendToVSCode() {
    const message = this.formatMessage();
    
    // Method 1: VSCode Command URI
    const encodedMessage = encodeURIComponent(JSON.stringify([message]));
    const vscodeUri = `vscode://command/codersinflow.sendMessage?args=${encodedMessage}`;
    
    // Try to trigger the command
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = vscodeUri;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 100);
    
    // Method 2: Copy to clipboard as fallback
    navigator.clipboard.writeText(message);
  }
  
  formatMessage() {
    let msg = "I want to use the following components on my site:\n\n";
    this.selectedComponents.forEach((comp) => {
      msg += `• ${comp.name} (${comp.site}/data/${comp.path})\n`;
    });
    return msg;
  }
}
```

**Modified DevModeOverlay**:
```javascript
const handleToggleReusable = (componentId: string) => {
  const component = components.get(componentId);
  if (!isDashboardMode) {
    // Original behavior
    return;
  }
  
  // Dashboard mode - send to parent
  if (component.isSelected) {
    window.parent.postMessage({
      type: 'COMPONENT_DESELECTED',
      component: {
        id: componentId,
        name: component.name,
        path: component.dataPath,
        site: getCurrentSite()
      }
    }, '*');
  } else {
    window.parent.postMessage({
      type: 'COMPONENT_SELECTED',
      component: {
        id: componentId,
        name: component.name,
        path: component.dataPath,
        site: getCurrentSite()
      }
    }, '*');
  }
  
  // Update local state
  component.isSelected = !component.isSelected;
};
```

### 6. Benefits

1. **Clean Separation**: Dev tools only active in dashboard mode
2. **Multi-Site Support**: Browse and select from all sites
3. **VSCode Integration**: Direct path to code generation
4. **User-Friendly**: Visual selection with immediate feedback
5. **Extensible**: Can add more features like bulk operations

### 7. Future Enhancements

- Filter components by type
- Search components by name
- Preview selected components
- Generate complete page layouts
- Save component sets as templates
- Direct code generation from dashboard
- Component dependency resolution

### 8. Testing Plan

1. Load dashboard at root URL
2. Select site from dropdown
3. Verify iframe loads correctly
4. Select multiple components
5. Verify count updates
6. Click "Send to VSCode"
7. Verify message format
8. Check clipboard contents
9. Test with VSCode extension

## Implementation Details

### VSCode Extension Changes

#### 1. UICommandMessageService (`src/services/webview/UICommandMessageService.ts`)
Add new case in handleMessage:
```typescript
case 'fillChatInput':
  const { text } = payload as { text: string };
  if (text) {
    await this.sendUnifiedMessage({ 
      command: 'fillChatInput', 
      text 
    });
  }
  break;
```

#### 2. ChatPanel (`src/webview/components/ChatPanel/ChatPanel.tsx`)
Add in message handler (around line 1340):
```typescript
case 'fillChatInput':
  if (chatInputRef.current && message.text) {
    chatInputRef.current.setInputText(message.text);
    chatInputRef.current.focusInput();
  }
  break;
```

#### 3. Chat Commands (`src/commands/ui/chat-commands.ts`)
Modify codersinflow.sendMessage:
```typescript
vscode.commands.registerCommand('codersinflow.sendMessage', async (message: string) => {
  const messageRouter = MessageRouter.getInstance();
  await messageRouter.routeMessage({
    domain: 'ui',
    action: 'fillChatInput',
    payload: { text: message }
  });
});
```

### Message Flow
```
Dashboard → VSCode Command → MessageRouter → UICommandMessageService → ChatPanel → ChatInput
```

## Status

### Completed
- [x] Dashboard page created
- [x] Site selector and iframe implementation
- [x] Component selection in DevModeOverlay
- [x] PostMessage communication between frames
- [x] Message formatting and clipboard copy

### In Progress
- [ ] VSCode extension integration via domain messaging
- [ ] Testing end-to-end flow

## Next Steps

1. Implement fillChatInput handler in UICommandMessageService
2. Update ChatPanel to listen for fillChatInput command
3. Modify codersinflow.sendMessage command
4. Test the complete integration flow
5. Add error handling and user feedback