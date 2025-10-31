/**
 * Password Migration Script
 *
 * This script migrates existing plaintext passwords to bcrypt hashes.
 *
 * IMPORTANT:
 * - Run this script ONCE to migrate existing passwords
 * - After running, all passwords will be bcrypt hashed
 * - Make a database backup before running this script
 *
 * Usage: node migrate-passwords.js
 */

const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const config = require('./config');

const SALT_ROUNDS = 10;

async function migratePasswords() {
  let client;

  try {
    console.log('Connecting to database...');
    client = await MongoClient.connect(config.database_url);
    const db = client.db(config.db_name);
    const users = db.collection('users');

    console.log('Fetching all users...');
    const allUsers = await users.find({}).toArray();

    if (allUsers.length === 0) {
      console.log('No users found in database.');
      return;
    }

    console.log(`Found ${allUsers.length} user(s). Starting migration...`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of allUsers) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
        if (user.password && user.password.startsWith('$2')) {
          console.log(`  - User "${user.user}": Password already hashed, skipping.`);
          skipped++;
          continue;
        }

        // Hash the plaintext password
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

        // Update the user document
        await users.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`  ✓ User "${user.user}": Password successfully hashed.`);
        migrated++;

      } catch (error) {
        console.error(`  ✗ User "${user.user}": Error - ${error.message}`);
        errors++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped (already hashed): ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log('=========================\n');

    if (errors > 0) {
      console.warn('⚠ Some passwords failed to migrate. Please review the errors above.');
    } else if (migrated > 0) {
      console.log('✓ Migration completed successfully!');
    } else {
      console.log('All passwords were already hashed. No migration needed.');
    }

  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed.');
    }
  }
}

// Confirm before running
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        PASSWORD MIGRATION SCRIPT                           ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('This script will convert all plaintext passwords to bcrypt hashes.');
console.log('');
console.log('⚠  IMPORTANT: Make sure you have a database backup before proceeding!');
console.log('');
console.log('Starting migration in 3 seconds...');
console.log('Press Ctrl+C to cancel.');
console.log('');

setTimeout(() => {
  migratePasswords().then(() => {
    process.exit(0);
  });
}, 3000);
