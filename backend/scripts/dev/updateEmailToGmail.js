const db = require('./config/database');

async function updateEmailToGmail() {
    try {
        // Update receptionist email to @gmail.com
        const [result] = await db.execute(
            'UPDATE users SET email = ? WHERE username = ?',
            ['receptions@gmail.com', 'receptions']
        );

        console.log('Receptionist email updated to @gmail.com successfully!');
        console.log('Username: receptions');
        console.log('Email: receptions@gmail.com');
        console.log('Password: 123456789');
        process.exit(0);
    } catch (error) {
        console.error('Error updating email:', error);
        process.exit(1);
    }
}

updateEmailToGmail();
