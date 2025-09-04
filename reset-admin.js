import bcrypt from 'bcryptjs';

// Generate hash for password "admin123"
const password = "admin123";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("Password: admin123");
console.log("Hash:", hash);
console.log("\nUse this MongoDB command to update the admin password:");
console.log(`db.users.updateOne({email: "admin@codersinflow.com"}, {$set: {password: "${hash}"}})`);