# Component System Documentation

## Overview

This multi-tenant Astro application uses a sophisticated component system with automatic dev-mode editing capabilities. Components can be edited in real-time through a visual overlay system without modifying code.

## Table of Contents
- [Auto-Wrapper System](#auto-wrapper-system)
- [Component Requirements](#component-requirements)
- [Dev Mode Overlay](#dev-mode-overlay)
- [Data Management](#data-management)
- [Component Types](#component-types)
- [Best Practices](#best-practices)

## Auto-Wrapper System

### How It Works

The auto-wrapper is an Astro integration that automatically wraps components with DevWrapper during build time, enabling dev mode editing without manual wrapper code.

#### Processing Flow:
1. **File Detection**: Processes `.astro` files in `/sites/*/pages/` and `/sites/*/layout.astro`
2. **Component Matching**: Identifies React/Astro components (uppercase first letter) with data props
3. **Data Detection**: Looks for props containing variables ending with "Data" or containing "data"
4. **Wrapper Injection**: Automatically wraps matched components with DevWrapper
5. **Import Addition**: Adds DevWrapper import at the top of the frontmatter

#### Key Features:
- No manual wrapping needed
- Skips components inside JSX expressions (e.g., `{showHeader && <Component />}`)
- Handles different import paths for layouts vs pages
- Only processes components with JSON data props

### Configuration

Located in `/astro-multi-tenant/src/shared/integrations/astro-auto-wrapper.js`

```javascript
// Pattern matches components starting with uppercase letter
const componentPattern = /<([A-Z]\w+)\s+([^>]*\w+=\{[^}]+\}[^>]*)(\/>|>[\s\S]*?<\/\1>)/g;

// Detects data props (variables ending with Data or containing data)
if (trimmedValue.match(/Data$|data/i) && !trimmedValue.startsWith('"')) {
  // Component will be wrapped
}
```

## Component Requirements

### For Auto-Wrapping to Work

1. **Component Name**: Must start with uppercase letter (React/Astro convention)
   ```jsx
   <Menu />           // ✅ Will be wrapped
   <menu />           // ❌ HTML element, won't be wrapped
   ```

2. **Data Prop**: Must receive a variable that looks like imported JSON data
   ```jsx
   <Menu data={navigationData} />     // ✅ Will be wrapped
   <Menu data={hardcodedObject} />    // ✅ Will be wrapped if contains "data"
   <Menu className="nav" />           // ❌ No data prop
   ```

3. **File Location**: Component usage must be in:
   - `/sites/*/pages/*.astro`
   - `/sites/*/layout.astro`

### Component Structure

#### JSX Components
```jsx
// ComponentName.jsx
const ComponentName = ({ data = {} }) => {
  // Destructure with defaults
  const {
    field1 = "default value",
    field2 = [],
    field3 = {}
  } = data;

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

#### Astro Usage
```astro
---
import ComponentName from '../path/to/ComponentName.jsx';
import dataFile from '../data/component-data.json';
---

<!-- Auto-wrapper will handle this automatically -->
<ComponentName data={dataFile} />
```

## Dev Mode Overlay

### How It Works

The DevModeOverlay component (`/src/shared/components/Dev/DevModeOverlay.tsx`) provides:

1. **Component Detection**: Scans DOM for elements with `data-component-*` attributes
2. **Visual Overlays**: Shows component boundaries with hover effects
3. **JSON Editor**: Modal for editing component data
4. **Live Updates**: Changes saved to JSON files and page reloads

### Data Attributes

Components wrapped by DevWrapper get these attributes:
- `data-component-id`: Unique identifier
- `data-component-name`: Display name
- `data-component-path`: JSON file path
- `data-component-props`: Current props data

### Array Handling

For components in arrays (like ProjectItems):
```jsx
// Data path includes array notation
dataPath="projects-items.json[0]"

// DevModeOverlay parses this to:
// - Load projects-items.json
// - Edit only index 0
// - Save back to the full array
```

## Data Management

### JSON File Structure

#### Single Component Data
```json
{
  "title": "Component Title",
  "description": "Component description",
  "items": ["item1", "item2"]
}
```

#### Array Data
```json
[
  {
    "id": "1",
    "title": "Item 1",
    "description": "Description 1"
  },
  {
    "id": "2",
    "title": "Item 2",
    "description": "Description 2"
  }
]
```

### Data File Naming Convention

The auto-wrapper converts component prop names to file names:
- `navigationData` → `navigation.json`
- `projectsHeaderData` → `projects-header.json`
- `mainHeaderData` → `main-header.json`

### File Organization
```
/sites/[site-name]/data/
├── navigation.json       # Navigation menu data
├── header.json          # Site header data
├── footer.json          # Site footer data
├── hero.json           # Hero section data
├── projects-header.json # Projects section header
├── projects-items.json  # Projects items array
└── ...
```

## Component Types

### Navigation Components

#### Menu Component
```jsx
const Menu = ({ data = {} }) => {
  const {
    brandText = "Default Brand",
    links = [
      { href: "/", text: "Home" },
      { href: "/about", text: "About" }
    ]
  } = data;

  return (
    <nav>
      <div>{brandText}</div>
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <a href={link.href}>{link.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Section Components

#### Split Pattern
Sections are split into header and content for independent editing:

```astro
<!-- Instead of one combined component -->
<Projects data={projectsData} />

<!-- Use split components -->
<ProjectsHeader data={projectsHeaderData} />
<ProjectsItems data={projectsItemsData} />
```

### List Components

For components that render lists:
```jsx
const ItemsList = ({ data = [] }) => {
  return (
    <div className="grid">
      {data.map((item, index) => (
        <ItemCard key={item.id || index} {...item} />
      ))}
    </div>
  );
};
```

## Best Practices

### 1. Component Design

- **Always use default values** to prevent errors with empty data
- **Keep components pure** - data in, JSX out
- **Split complex sections** into header/content components
- **Use descriptive prop names** that end with "Data" for auto-detection

### 2. Data Structure

- **Keep JSON flat** when possible for easier editing
- **Use arrays** for repeating items
- **Include IDs** for array items to maintain React keys
- **Separate concerns** - split combined data into logical files

### 3. Styling with Tailwind

When using dynamic classes from JSON:
```javascript
// tailwind.config.cjs
module.exports = {
  safelist: [
    'bg-blue-600',
    'bg-green-500',
    // Add all dynamic colors used in JSON
  ]
}
```

### 4. Client-Side Hydration

Components with interactivity need hydration directives:
```astro
<Component client:load data={data} />    <!-- Loads immediately -->
<Component client:visible data={data} /> <!-- Loads when visible -->
<Component client:idle data={data} />    <!-- Loads when idle -->
```

### 5. Development Workflow

1. **Create JSON data file** in `/sites/[site]/data/`
2. **Create/update component** to accept data prop
3. **Import both** in your Astro page/layout
4. **Use component** with data prop - auto-wrapper handles the rest
5. **Edit in browser** using dev overlay in development mode

## Troubleshooting

### Component Not Getting Wrapped

Check:
1. Component name starts with uppercase
2. Has a data prop with a variable
3. Variable name contains "data" or ends with "Data"
4. File is in pages/ or is layout.astro
5. Not inside a JSX expression

### Overlay Not Showing

Check:
1. Dev mode is enabled (`npm run dev`)
2. DevModeOverlay has `client:load` directive
3. Component has required data attributes
4. No JavaScript errors in console

### Changes Not Saving

Check:
1. Backend API is running (port 3001)
2. File permissions allow writing
3. JSON syntax is valid
4. Correct file path in dataPath attribute

## API Endpoints

The Go backend provides these endpoints for the dev overlay:

- `GET /api/component-data?path=[file]&site=[site]` - Fetch JSON data
- `PUT /api/component-data` - Update JSON data
  ```json
  {
    "path": "navigation.json",
    "site": "prestongarrison.com",
    "data": { /* updated data */ }
  }
  ```

## Example: Adding a New Editable Component

1. **Create the data file** `/sites/mysite/data/testimonials.json`:
```json
{
  "title": "What Our Users Say",
  "items": [
    {
      "id": "1",
      "author": "John Doe",
      "text": "Great product!",
      "rating": 5
    }
  ]
}
```

2. **Create the component** `/src/shared/components/Testimonials.jsx`:
```jsx
const Testimonials = ({ data = {} }) => {
  const {
    title = "Testimonials",
    items = []
  } = data;

  return (
    <section>
      <h2>{title}</h2>
      <div className="grid">
        {items.map(item => (
          <div key={item.id}>
            <p>{item.text}</p>
            <cite>- {item.author}</cite>
            <span>{"⭐".repeat(item.rating)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
```

3. **Use in page** `/sites/mysite/pages/index.astro`:
```astro
---
import Testimonials from '../../../shared/components/Testimonials.jsx';
import testimonialsData from '../data/testimonials.json';
---

<!-- Auto-wrapper will handle this automatically -->
<Testimonials client:visible data={testimonialsData} />
```

The component will automatically be wrapped and editable in dev mode!