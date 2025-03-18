require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  
  // Check environment variables
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.log('Please check your .env file or environment variables.');
    process.exit(1);
  }
  
  // Create connection
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME
    });
    
    // Run a simple query to test connection
    const [result] = await connection.query('SELECT 1 + 1 AS solution');
    
    console.log('✅ Successfully connected to the database!');
    console.log('Connection details:');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- Port: ${process.env.DB_PORT}`);
    console.log(`- User: ${process.env.DB_USER}`);
    console.log(`- Database: ${process.env.DB_NAME}`);
    
    // Get database tables
    const [tables] = await connection.query(
      'SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = ?', 
      [process.env.DB_NAME]
    );
    
    console.log('\n📊 Database tables:');
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach(table => {
        console.log(`- ${table.table_name} (${table.table_rows || 'unknown'} rows)`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error(error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Verify that the database exists');
    console.log('4. Ensure your MySQL user has proper permissions');
    process.exit(1);
  }
}

testDatabaseConnection().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
}); 