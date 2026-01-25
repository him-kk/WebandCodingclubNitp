// MongoDB initialization script
// This runs when the MongoDB container starts for the first time

db = db.getSiblingDB('web-coding-club');

// Create admin user (optional, for MongoDB admin access)
db.createUser({
  user: 'admin',
  pwd: 'adminpassword',
  roles: [
    {
      role: 'userAdminAnyDatabase',
      db: 'admin'
    },
    {
      role: 'readWriteAnyDatabase',
      db: 'admin'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ points: -1 });
db.events.createIndex({ date: 1 });
db.events.createIndex({ status: 1 });
db.projects.createIndex({ category: 1 });
db.projects.createIndex({ status: 1 });

print('MongoDB initialized successfully!');
