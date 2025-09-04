#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🔐 Generating new secure secrets...${colors.reset}\n`);

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}❌ No .env file found. Run 'npm install' first.${colors.reset}`);
  process.exit(1);
}

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Generate new JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(`${colors.green}✅ Generated new JWT secret (128 chars)${colors.reset}`);

// Generate new session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(`${colors.green}✅ Generated new session secret (64 chars)${colors.reset}`);

// Replace JWT_SECRET
if (envContent.includes('JWT_SECRET=')) {
  envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
} else {
  envContent += `\n# Security\nJWT_SECRET=${jwtSecret}\n`;
}

// Replace SESSION_SECRET
if (envContent.includes('SESSION_SECRET=')) {
  envContent = envContent.replace(/SESSION_SECRET=.*/g, `SESSION_SECRET=${sessionSecret}`);
} else {
  envContent += `SESSION_SECRET=${sessionSecret}\n`;
}

// Backup old .env
const backupPath = path.join(process.cwd(), `.env.backup.${Date.now()}`);
fs.copyFileSync(envPath, backupPath);
console.log(`${colors.blue}📋 Backed up old .env to ${path.basename(backupPath)}${colors.reset}`);

// Write new .env
fs.writeFileSync(envPath, envContent);

console.log(`${colors.green}✅ Updated .env with new secure secrets${colors.reset}`);
console.log(`${colors.yellow}⚠️  Restart your servers for changes to take effect${colors.reset}\n`);