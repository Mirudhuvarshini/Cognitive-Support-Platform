import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'neuroassist_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log("Database created or already exists.");
        await connection.end();

        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName
        });

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('user', 'caregiver') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Users table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                user_id INT PRIMARY KEY,
                diagnosis_status ENUM('Yes', 'No', 'Not Sure') DEFAULT 'Not Sure',
                conditions JSON,
                age INT,
                symptoms JSON,
                additional_notes TEXT,
                communication_style VARCHAR(100) DEFAULT 'gentle',
                theme_preference VARCHAR(50) DEFAULT 'calm',
                font_size DECIMAL(3,2) DEFAULT 1.00,
                animations_enabled BOOLEAN DEFAULT TRUE,
                high_contrast BOOLEAN DEFAULT FALSE,
                dyslexia_font BOOLEAN DEFAULT FALSE,
                points INT DEFAULT 0,
                level INT DEFAULT 1,
                streak_days INT DEFAULT 0,
                last_active DATE,
                consent_audio BOOLEAN DEFAULT FALSE,
                consent_video BOOLEAN DEFAULT FALSE,
                consent_activity BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Profiles table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                timeline VARCHAR(20),
                status ENUM('pending', 'completed') DEFAULT 'pending',
                ai_suggested BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Tasks table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS mood_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mood VARCHAR(50) NOT NULL,
                sensory_level INT DEFAULT 50,
                energy_level INT DEFAULT 50,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("MoodLogs table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100),
                phone VARCHAR(30),
                email VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                notify_on_sos BOOLEAN DEFAULT TRUE,
                notify_on_mood_crisis BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("EmergencyContacts table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS chat_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                sender ENUM('user', 'ai') NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("ChatHistory table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS game_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                game_type VARCHAR(100) NOT NULL,
                score INT DEFAULT 0,
                difficulty VARCHAR(50) DEFAULT 'medium',
                duration_seconds INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("GameScores table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                mood VARCHAR(50),
                tags JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("JournalEntries table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS routines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                time_slot VARCHAR(20),
                category ENUM('self-care', 'therapy', 'school', 'work', 'leisure', 'exercise', 'medication') DEFAULT 'self-care',
                days JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Routines table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS community_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'general',
                is_anonymous BOOLEAN DEFAULT TRUE,
                likes_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("CommunityPosts table ready.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS caregiver_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                caregiver_id INT NOT NULL,
                patient_id INT NOT NULL,
                status ENUM('pending', 'active', 'revoked') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("CaregiverLinks table ready.");

        await db.end();
        console.log("Database initialization complete.");

    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB();
