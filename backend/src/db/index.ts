import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        teacher_id INTEGER REFERENCES users(id),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        full_name TEXT,
        phone TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS group_students (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(group_id, student_id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        amount DECIMAL(10, 2) NOT NULL,
        paid_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        month VARCHAR(50),
        year INTEGER
      );

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'full_name'
        ) THEN
          ALTER TABLE students ADD COLUMN full_name TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'phone'
        ) THEN
          ALTER TABLE students ADD COLUMN phone TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'parent_name'
        ) THEN
          ALTER TABLE students ADD COLUMN parent_name TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'parent_phone'
        ) THEN
          ALTER TABLE students ADD COLUMN parent_phone TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'teacher_id'
        ) THEN
          ALTER TABLE students ADD COLUMN teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'students' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE students ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
    `);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default pool;
