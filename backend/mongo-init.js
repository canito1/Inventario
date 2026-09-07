// MongoDB initialization script
db = db.getSiblingDB('inventory_system');

// Create collections
db.createCollection('users');
db.createCollection('categories');
db.createCollection('items');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.categories.createIndex({ "name": 1 }, { unique: true });
db.items.createIndex({ "name": 1 });
db.items.createIndex({ "category": 1 });
db.items.createIndex({ "barcode": 1 }, { unique: true, sparse: true });
db.items.createIndex({ "quantity": 1, "minStock": 1 });

print('Database initialized successfully!');