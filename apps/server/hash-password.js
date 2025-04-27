// hash-password.js
const bcrypt = require("bcrypt"); // Use bcrypt

// --- Configuration ---
const passwordToHash = "NewUserPwd456!"; // The new password you want to set
const saltRounds = 10; // Make sure this matches your application's setting (it does based on our check)
// --- End Configuration ---

if (!passwordToHash) {
  console.error("Error: Please set the 'passwordToHash' variable in the script.");
  process.exit(1);
}

console.log(`Hashing password: "${passwordToHash}" with ${saltRounds} salt rounds...`);

// Use async/await with bcrypt
async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);
    console.log("\n--- Hashed Password ---");
    console.log(hashedPassword);
    console.log("-----------------------\n");
    console.log("Update the 'password' field in your MongoDB user document with this hash.");
  } catch (error) {
    console.error("Error hashing password:", error);
    process.exit(1);
  }
}

hashPassword();
