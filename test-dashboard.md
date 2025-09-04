# Testing the VSCode Integration Dashboard

## Servers Running

1. **Astro Dev Server**: http://localhost:4321
2. **Go Backend API**: http://localhost:3001

## Test Steps

### 1. Open the Dashboard
Visit: http://localhost:4321/

This should show:
- Site selector dropdown (prestongarrison.com, darkflows.com, codersinflow.com)
- Selected components counter
- "Send to VSCode" button
- Iframe showing the selected site

### 2. Test Component Selection
1. The iframe should load with `?dashboardMode=true` parameter
2. Hover over components - should see "Select" checkbox instead of "Reuse"
3. Check some components - they should:
   - Get green outline when selected
   - Appear in the "Selected Components" list
   - Update the counter

### 3. Test Site Switching
1. Change the dropdown to different sites
2. The iframe should reload with the new site
3. Selected components should persist in the list

### 4. Test VSCode Integration
1. Click "Send to VSCode" button
2. Should copy formatted message to clipboard:
```
I want to use the following components on my site:

• ComponentName (site.com/data/component.json)
• AnotherComponent (site.com/data/another.json)

Components selected from multi-tenant dashboard.
```

### 5. Integration with VSCode Extension
The message format is ready to be sent to the VSCode extension's message system.
The extension can receive this via:
- Clipboard paste
- HTTP POST to localhost:3005 (if extension is listening)
- Custom protocol handler

## Component Behavior in Dashboard Mode

| Feature | Normal Mode | Dashboard Mode |
|---------|------------|---------------|
| Checkbox Label | "Reuse" | "Select" |
| Checkbox Action | Toggle reusable | Send to parent frame |
| Component Outline | Blue dashed on hover | Green solid when selected |
| Reorder Buttons | Visible | Hidden |
| Edit JSON Button | Visible | Hidden |

## PostMessage Communication

### From Iframe to Dashboard:
```javascript
{
  type: 'COMPONENT_SELECTED',
  component: {
    id: 'comp-123',
    name: 'Hero',
    path: 'hero.json',
    site: 'prestongarrison.com'
  }
}
```

### From Dashboard to Iframe:
```javascript
{
  type: 'CLEAR_ALL_SELECTIONS'
}
```

## Known Issues to Fix

1. Site detection might need refinement for different localhost ports
2. Component paths should be relative to site root
3. Need to handle authentication for protected sites