// Switch to the codersblog database
db = db.getSiblingDB('codersblog');

// Create collections
db.createCollection('users');
db.createCollection('posts');
db.createCollection('categories');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ type: 1, createdAt: -1 });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ category: 1 });
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ type: 1 });

// Create text search index for posts
db.posts.createIndex({ title: "text", content: "text", description: "text" });

// Insert default admin user (password: admin123)
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$YKUveU2HMR5rKgJZWTQkiOH.9pJ9YxV6F5V7qV4UC.fVwCjDwJZ.m", 
  role: "admin",
  approved: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert default categories
db.categories.insertMany([
  {
    name: "General",
    slug: "general",
    type: "blog",
    createdAt: new Date()
  },
  {
    name: "Getting Started",
    slug: "getting-started",
    type: "docs",
    createdAt: new Date()
  }
]);

print("Database initialization completed");