/**
 * User Creation Script
 *
 * Creates a new user with a bcrypt-hashed password.
 *
 * Usage: node create-user.js <username> <password>
 *
 * Example: node create-user.js alice mySecurePassword123
 */

const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const config = require('./config');

const SALT_ROUNDS = 10;

async function createUser(username, password) {
  let client;

  try {
    // Validate input
    if (!username || !password) {
      console.error('Error: Username and password are required.');
      console.log('Usage: node create-user.js <username> <password>');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Error: Password must be at least 6 characters long.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    client = await MongoClient.connect(config.database_url);
    const db = client.db(config.db_name);
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ user: username });
    if (existingUser) {
      console.error(`Error: User "${username}" already exists.`);
      process.exit(1);
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert the new user
    console.log('Creating user...');
    await users.insertOne({
      user: username,
      password: hashedPassword,
      created: new Date()
    });

    console.log(`✓ User "${username}" created successfully!`);
    console.log('');
    console.log('You can now login with:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);

  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const username = args[0];
const password = args[1];

if (!username || !password) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        USER CREATION SCRIPT                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Usage: node create-user.js <username> <password>');
  console.log('');
  console.log('Example:');
  console.log('  node create-user.js alice mySecurePassword123');
  console.log('');
  process.exit(1);
}

createUser(username, password);
