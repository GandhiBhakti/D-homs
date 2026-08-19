require("dotenv").config();
const db = require("../config/database");
const bcrypt = require("bcryptjs");

async function setupDefaultUsers() {
  try {
    console.log("Setting up default users...\n");

    const users = [
      {
        email: "admin@gmail.com",
        password: "123456789",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      },
      {
        email: "receptionist@gmail.com",
        password: "123456789",
        first_name: "Receptionist",
        last_name: "User",
        role: "receptionist",
      },
    ];

    for (const user of users) {
      // Check if user already exists
      const [existingUsers] = await db.execute(
        "SELECT id FROM users WHERE email = ?",
        [user.email],
      );

      const hashedPassword = await bcrypt.hash(user.password, 10);

      if (existingUsers.length > 0) {
        // Update existing user
        const userId = existingUsers[0].id;
        await db.execute("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          userId,
        ]);
        console.log(`✓ Updated ${user.role}: ${user.email}`);
        console.log(`  Password: ${user.password}\n`);
      } else {
        // Create new user
        await db.execute(
          "INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
          [
            user.email,
            hashedPassword,
            user.first_name,
            user.last_name,
            user.role,
            true,
          ],
        );
        console.log(`✓ Created ${user.role}: ${user.email}`);
        console.log(`  Password: ${user.password}\n`);
      }
    }

    console.log("✓ Default users setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error setting up users:", error.message);
    process.exit(1);
  }
}

setupDefaultUsers();
