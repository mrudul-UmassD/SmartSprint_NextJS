const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const inquirer = require('inquirer');

// Load environment variables from .env file if it exists
dotenv.config();

async function main() {
  console.log('\n🚀 SmartSprint - Database Setup Tool');
  console.log('======================================\n');
  
  // Collect database connection info
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Database host:',
      default: process.env.DB_HOST || 'localhost'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Database port:',
      default: process.env.DB_PORT || '3306'
    },
    {
      type: 'input',
      name: 'user',
      message: 'Database username:',
      default: process.env.DB_USER || 'root'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Database password:',
      default: process.env.DB_PASSWORD || ''
    },
    {
      type: 'input',
      name: 'database',
      message: 'Database name to create:',
      default: process.env.DB_NAME || 'smartsprint'
    },
    {
      type: 'confirm',
      name: 'createEnvFile',
      message: 'Create/update .env file with database credentials?',
      default: true
    }
  ]);

  // Connect to MySQL to create database
  try {
    console.log('\n📊 Connecting to MySQL server...');
    
    // First connect without database to create it
    const connection = await mysql.createConnection({
      host: answers.host,
      port: answers.port,
      user: answers.user,
      password: answers.password
    });

    // Create database if not exists
    console.log(`🗄️  Creating database '${answers.database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${answers.database}\``);
    
    // Switch to the created database
    await connection.query(`USE \`${answers.database}\``);
    
    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        avatar_url VARCHAR(255),
        role ENUM('admin', 'manager', 'developer') NOT NULL DEFAULT 'developer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('active', 'completed', 'on_hold', 'archived') NOT NULL DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('todo', 'inProgress', 'review', 'done') NOT NULL DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        assignee_id VARCHAR(36),
        project_id VARCHAR(36),
        parent_task_id VARCHAR(36),
        estimated_hours FLOAT,
        actual_hours FLOAT,
        completion_percentage INT DEFAULT 0,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);
    
    // Task dependencies
    await connection.query(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        depends_on_task_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE(task_id, depends_on_task_id)
      )
    `);
    
    // Task tags
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3f51b5',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Task-Tag relationship (many-to-many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS task_tags (
        task_id VARCHAR(36) NOT NULL,
        tag_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (task_id, tag_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);
    
    // Comments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Insert initial tags
    await connection.query(`
      INSERT IGNORE INTO tags (id, name, color) VALUES 
      (UUID(), 'frontend', '#3f51b5'),
      (UUID(), 'backend', '#f50057'),
      (UUID(), 'bug', '#f44336'),
      (UUID(), 'feature', '#4caf50'),
      (UUID(), 'documentation', '#ff9800'),
      (UUID(), 'api', '#2196f3'),
      (UUID(), 'database', '#9c27b0'),
      (UUID(), 'ui', '#009688'),
      (UUID(), 'testing', '#607d8b'),
      (UUID(), 'security', '#e91e63')
    `);
    
    // Insert a default admin user (password: admin123)
    // In production, you'd want to generate a secure password and hash
    await connection.query(`
      INSERT IGNORE INTO users (id, username, email, password, full_name, role)
      VALUES (UUID(), 'admin', 'admin@smartsprint.com', '$2b$10$RQm/YX1FDxGd27YcN/RC5eDZoB7AtGyG5EcbZ95h.KNQ2UJo5aYWa', 'Admin User', 'admin')
    `);
    
    console.log('✅ Database tables created successfully!');
    
    // Create/update .env file if requested
    if (answers.createEnvFile) {
      const envPath = path.resolve(process.cwd(), '.env');
      
      let envContent = '';
      
      // Read existing .env file if it exists
      try {
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
      } catch (err) {
        console.error('Error reading existing .env file:', err);
      }
      
      // Update or add database environment variables
      const envVars = {
        DB_HOST: answers.host,
        DB_PORT: answers.port,
        DB_USER: answers.user,
        DB_PASSWORD: answers.password,
        DB_NAME: answers.database
      };
      
      // Update each environment variable
      Object.entries(envVars).forEach(([key, value]) => {
        // Check if the variable already exists in the file
        const regex = new RegExp(`^${key}=.*$`, 'm');
        
        if (regex.test(envContent)) {
          // Replace existing variable
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          // Add new variable
          envContent += `\n${key}=${value}`;
        }
      });
      
      // Write updated content to .env file
      try {
        fs.writeFileSync(envPath, envContent.trim());
        console.log('✅ .env file updated with database credentials');
      } catch (err) {
        console.error('Error writing .env file:', err);
      }
    }
    
    await connection.end();
    
    console.log('\n✨ Database setup completed successfully!');
    console.log('You can now start your application with:');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error(error);
    process.exit(1);
  }
}

main(); 