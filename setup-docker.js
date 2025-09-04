#!/usr/bin/env node

/**
 * Docker Setup Script
 * Uses template system to generate Docker configurations from site.config.json
 * Calls the process-docker-templates.sh script which handles the actual generation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for site.config.json
const configPath = path.join(__dirname, 'site.config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ site.config.json not found! This file is required.');
  console.error('Please create site.config.json with your configuration.');
  process.exit(1);
}

// Check if the template processing script exists
const scriptPath = path.join(__dirname, 'scripts', 'process-docker-templates.sh');
if (!fs.existsSync(scriptPath)) {
  console.error('❌ scripts/process-docker-templates.sh not found!');
  console.error('Please ensure the template processing script exists.');
  process.exit(1);
}

// Run the template processing script
console.log('🚀 Processing Docker templates...\n');

try {
  const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
    cwd: __dirname,
    env: { ...process.env }
  });
  
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  
  console.log('\n✨ Docker setup complete!');
} catch (error) {
  console.error('❌ Error processing templates:', error.message);
  if (error.stdout) console.log(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}