const bcrypt = require('bcryptjs');

async function testPasswordValidation() {
  const storedPassword = '12345678';
  const submittedPassword = '12345678';
  
  console.log('Testing password validation...');
  console.log('Stored password:', storedPassword);
  console.log('Submitted password:', submittedPassword);
  
  // Test bcrypt comparison
  try {
    const isHashMatch = await bcrypt.compare(submittedPassword, storedPassword);
    console.log('Bcrypt comparison result:', isHashMatch);
  } catch (error) {
    console.log('Bcrypt comparison failed:', error.message);
  }
  
  // Test plain text comparison
  const plainMatch = submittedPassword === storedPassword;
  console.log('Plain text comparison result:', plainMatch);
  
  // Simulate the validatePassword function
  const validatePassword = async (submittedPassword, storedPassword) => {
    if (!storedPassword) return false;
    try {
      const isHashMatch = await bcrypt.compare(submittedPassword, storedPassword);
      if (isHashMatch) return true;
    } catch (error) {
      // Fall back to legacy plaintext support.
    }
    return submittedPassword === storedPassword;
  };
  
  const result = await validatePassword(submittedPassword, storedPassword);
  console.log('Final validation result:', result);
}

testPasswordValidation();
