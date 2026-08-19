const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function createReceptionist() {
    try {
        // Check if receptionist already exists
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', ['receptions']);
        
        if (existing.length > 0) {
            console.log('Receptionist user already exists');
            process.exit(0);
        }

        // Hash password (123456789)
        const hashedPassword = await bcrypt.hash('123456789', 10);

        // Insert receptionist user
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['receptions', 'receptionist@gmail.com', hashedPassword, 'Reception', 'Desk', 'receptionist', true]
        );

        console.log('Receptionist user created successfully!');
        console.log('Username: receptions');
        console.log('Password: 123456789');
        console.log('User ID:', result.insertId);
        process.exit(0);
    } catch (error) {
        console.error('Error creating receptionist:', error);
        process.exit(1);
    }
}

createReceptionist();
