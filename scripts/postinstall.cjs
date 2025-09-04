#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🚀 Running post-install setup...${colors.reset}\n`);

// 1. Install dependencies in astro-multi-tenant
console.log(`${colors.blue}📦 Installing astro-multi-tenant dependencies...${colors.reset}`);
try {
  execSync('cd astro-multi-tenant && npm install', { stdio: 'inherit' });
  console.log(`${colors.green}✅ Astro dependencies installed${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}❌ Failed to install astro dependencies${colors.reset}`);
  process.exit(1);
}

// 2. Create .env file if it doesn't exist
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log(`${colors.blue}📝 Creating .env file...${colors.reset}`);
  
  if (fs.existsSync(envExamplePath)) {
    // Read the example file
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Generate a secure JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    envContent = envContent.replace(
      'JWT_SECRET=your-secret-key-change-this-in-production',
      `JWT_SECRET=${jwtSecret}`
    );
    
    // Generate a session secret
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    if (envContent.includes('SESSION_SECRET=')) {
      envContent = envContent.replace(
        /SESSION_SECRET=.*/,
        `SESSION_SECRET=${sessionSecret}`
      );
    } else {
      // Add session secret if not in template
      envContent += `\n# Session Secret\nSESSION_SECRET=${sessionSecret}\n`;
    }
    
    // Write the new .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`${colors.green}✅ Created .env file with secure secrets${colors.reset}`);
    console.log(`${colors.yellow}   ⚠️  Please review and update .env with your specific settings${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  No .env.example found, creating basic .env${colors.reset}`);
    
    // Create a basic .env with secure defaults
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    
    const basicEnv = `# Environment Configuration
NODE_ENV=development
PORT=4321
API_PORT=3001

# API Configuration  
PUBLIC_API_URL=http://localhost:3001
PUBLIC_DEV_API_PORT=3001
PUBLIC_DEV_FRONTEND_PORT=4321

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/codersblog
MONGODB_PORT=27017

# Security - Auto-generated secure secrets
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# Site Configuration
PUBLIC_SITE_URL=http://localhost:4321
SITES_CONFIG_PATH=./sites-config.json

# CORS
CORS_ORIGIN=*
ALLOWED_DOMAINS=localhost,127.0.0.1
`;
    
    fs.writeFileSync(envPath, basicEnv);
    console.log(`${colors.green}✅ Created .env file with secure defaults${colors.reset}\n`);
  }
} else {
  console.log(`${colors.green}✅ .env file already exists${colors.reset}`);
  
  // Check if JWT_SECRET needs updating
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('JWT_SECRET=your-secret-key-change-this-in-production')) {
    console.log(`${colors.yellow}⚠️  WARNING: JWT_SECRET is still using the default value!${colors.reset}`);
    console.log(`${colors.yellow}   Run 'npm run generate-secrets' to update it${colors.reset}\n`);
  }
}

// 3. Create sites-config.json if it doesn't exist
const sitesConfigPath = path.join(process.cwd(), 'sites-config.json');
if (!fs.existsSync(sitesConfigPath)) {
  console.log(`${colors.blue}📝 Creating sites-config.json...${colors.reset}`);
  
  const defaultSitesConfig = {
    "codersinflow.com": {
      "id": "codersinflow",
      "name": "CodersInFlow",
      "description": "AI-Powered Pair Programming Platform",
      "directory": "codersinflow.com",
      "database": "codersinflow_db",
      "theme": "dark-blue",
      "features": ["blog", "auth", "payments"]
    },
    "www.codersinflow.com": {
      "id": "codersinflow",
      "name": "CodersInFlow",
      "description": "AI-Powered Pair Programming Platform",
      "directory": "codersinflow.com",
      "database": "codersinflow_db",
      "theme": "dark-blue",
      "features": ["blog", "auth", "payments"]
    },
    "darkflows.com": {
      "id": "darkflows",
      "name": "DarkFlows",
      "description": "Advanced Router OS & Network Solutions",
      "directory": "darkflows.com",
      "database": "darkflows_db",
      "theme": "dark-red",
      "features": ["blog", "docs"]
    },
    "www.darkflows.com": {
      "id": "darkflows",
      "name": "DarkFlows",
      "description": "Advanced Router OS & Network Solutions",
      "directory": "darkflows.com",
      "database": "darkflows_db",
      "theme": "dark-red",
      "features": ["blog", "docs"]
    },
    "prestongarrison.com": {
      "id": "prestongarrison",
      "name": "Preston Garrison",
      "description": "Full Stack Developer Portfolio",
      "directory": "prestongarrison.com",
      "database": "prestongarrison_db",
      "theme": "light",
      "features": ["blog", "docs"]
    },
    "www.prestongarrison.com": {
      "id": "prestongarrison",
      "name": "Preston Garrison",
      "description": "Full Stack Developer Portfolio",
      "directory": "prestongarrison.com",
      "database": "prestongarrison_db",
      "theme": "light",
      "features": ["blog", "docs"]
    },
    "localhost": {
      "id": "default",
      "directory": "default",
      "database": "default_db",
      "theme": "dark",
      "features": []
    },
    "127.0.0.1": {
      "id": "default",
      "directory": "default",
      "database": "default_db",
      "theme": "dark",
      "features": []
    },
    "default": {
      "id": "default",
      "directory": "default",
      "database": "default_db",
      "theme": "light",
      "features": ["blog"]
    }
  };
  
  fs.writeFileSync(sitesConfigPath, JSON.stringify(defaultSitesConfig, null, 2));
  console.log(`${colors.green}✅ Created sites-config.json${colors.reset}\n`);
} else {
  console.log(`${colors.green}✅ sites-config.json already exists${colors.reset}\n`);
}

// 4. Show next steps
console.log(`${colors.green}🎉 Setup complete!${colors.reset}\n`);
console.log('Next steps:');
console.log(`  1. Review and update ${colors.blue}.env${colors.reset} file if needed`);
console.log(`  2. Run ${colors.blue}./scripts/dev.sh${colors.reset} to start the development environment`);
console.log(`  3. Run ${colors.blue}./scripts/add-site.sh domain.com${colors.reset} to add new sites\n`);
console.log('Access the sites:');
console.log('  • Dashboard: http://localhost:4321');
console.log('  • Dashboard (component selector): http://localhost:4321/dashboard');
console.log('  • Sites work at: http://[sitename].localhost:4321\n');