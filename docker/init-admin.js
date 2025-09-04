// MongoDB initialization script to create default admin user
// This script is run automatically when MongoDB starts if the database is empty

const adminEmail = process.env.ADMIN_EMAIL || 'admin@codersinflow.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
const adminName = process.env.ADMIN_NAME || 'Admin';

// Switch to the application database
db = db.getSiblingDB('codersblog');

// Check if users collection exists and has any users
const userCount = db.users.countDocuments();

if (userCount === 0) {
  print('No users found, creating default admin user...');
  
  // Create the admin user
  // Note: Password should be hashed by the application when it first runs
  // This creates a placeholder that the app will update on first login
  db.users.insertOne({
    name: adminName,
    email: adminEmail,
    password: adminPassword, // Will be hashed by the application
    role: 'admin',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    needsPasswordReset: true // Flag to force password change on first login
  });
  
  print(`Default admin user created: ${adminEmail}`);
  print('IMPORTANT: Change the password on first login!');
} else {
  print(`Users already exist (${userCount}), skipping admin creation`);
}