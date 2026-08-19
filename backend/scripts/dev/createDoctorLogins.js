const db = require("./config/database");
const bcrypt = require("bcryptjs");

const doctors = [
  { id: 1, first_name: "Devansheeba", last_name: "Jadeja Sodha" },
  { id: 2, first_name: "Bharat", last_name: "Kalsariya" },
  { id: 3, first_name: "Rajveersinh", last_name: "Sodha" },
  { id: 4, first_name: "Upasna", last_name: "Dhuliya" },
  { id: 5, first_name: "Bhavesh", last_name: "Khandhar" },
];

async function createDoctorLogins() {
  try {
    const password = "123456789";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user accounts for doctors...\n");

    for (const doctor of doctors) {
      // Generate username from first name
      const username = doctor.first_name.toLowerCase().replace(/\s/g, "");
      const email = `${username}@gmail.com`;

      // Check if user already exists
      const [existingUsers] = await db.execute(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email],
      );

      let userId;

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(
          `User already exists for Dr. ${doctor.first_name} ${doctor.last_name} (User ID: ${userId})`,
        );

        // Update password
        await db.execute("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          userId,
        ]);
        console.log(`  -> Updated password to '123456789'`);
      } else {
        // Create new user
        const [result] = await db.execute(
          "INSERT INTO users (username, email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            username,
            email,
            hashedPassword,
            doctor.first_name,
            doctor.last_name,
            "doctor",
            true,
          ],
        );
        userId = result.insertId;
        console.log(
          `Created user for Dr. ${doctor.first_name} ${doctor.last_name} (User ID: ${userId})`,
        );
        console.log(`  -> Username: ${username}`);
        console.log(`  -> Email: ${email}`);
        console.log(`  -> Password: ${password}`);
      }

      // Update doctor record with user_id
      await db.execute("UPDATE doctors SET user_id = ? WHERE id = ?", [
        userId,
        doctor.id,
      ]);
      console.log(`  -> Linked to Doctor ID: ${doctor.id}\n`);
    }

    console.log("Doctor login accounts created successfully!");
  } catch (error) {
    console.error("Error creating doctor logins:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createDoctorLogins();
