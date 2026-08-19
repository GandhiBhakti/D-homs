const db = require('./config/database');

async function updateAllEmailsToGmail() {
    try {
        // Get all users
        const [users] = await db.execute('SELECT id, username, email FROM users');
        
        for (const user of users) {
            // Extract username part before @
            const emailUsername = user.email ? user.email.split('@')[0] : user.username;
            const newEmail = `${emailUsername}@gmail.com`;
            
            await db.execute(
                'UPDATE users SET email = ? WHERE id = ?',
                [newEmail, user.id]
            );
            
            console.log(`Updated user ${user.username}: ${user.email} -> ${newEmail}`);
        }
        
        console.log('All emails updated to @gmail.com successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating emails:', error);
        process.exit(1);
    }
}

updateAllEmailsToGmail();
