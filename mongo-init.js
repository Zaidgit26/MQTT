// MongoDB initialization script
db = db.getSiblingDB('mqtt_db');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['deviceId', 'password', 'consumerName', 'consumerAddress', 'consumerNo'],
      properties: {
        deviceId: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        consumerName: {
          bsonType: 'string',
          minLength: 1
        },
        consumerAddress: {
          bsonType: 'string',
          minLength: 1
        },
        consumerNo: {
          bsonType: 'string',
          minLength: 1
        }
      }
    }
  }
});

db.createCollection('devices', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['deviceId', 'data'],
      properties: {
        deviceId: {
          bsonType: 'string',
          minLength: 1
        },
        data: {
          bsonType: 'object'
        },
        lastUpdated: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ 'consumerNo': 1 }, { unique: true });
db.users.createIndex({ 'deviceId': 1 });
db.devices.createIndex({ 'deviceId': 1 }, { unique: true });
db.devices.createIndex({ 'lastUpdated': -1 });

print('Database initialized successfully');
