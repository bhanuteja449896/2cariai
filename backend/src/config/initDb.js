const pool = require('./database');

const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create Reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        report_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        report_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Reports table created');

    // Create Vitals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vitals (
        id SERIAL PRIMARY KEY,
        report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        vital_type VARCHAR(50) NOT NULL,
        vital_value VARCHAR(100) NOT NULL,
        unit VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Vitals table created');

    // Create Shared Access table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_access (
        id SERIAL PRIMARY KEY,
        report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        shared_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shared_with_email VARCHAR(255) NOT NULL,
        shared_with_name VARCHAR(255),
        access_type VARCHAR(20) DEFAULT 'viewer',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Shared Access table created');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);
      CREATE INDEX IF NOT EXISTS idx_vitals_report_id ON vitals(report_id);
      CREATE INDEX IF NOT EXISTS idx_vitals_type ON vitals(vital_type);
      CREATE INDEX IF NOT EXISTS idx_shared_access_email ON shared_access(shared_with_email);
    `);
    console.log('✓ Indexes created');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
