require("dotenv").config();

const {
  verifyMailConnection,
} = require("./src/config/mail.config");

const testSMTP = async () => {
  try {
    await verifyMailConnection();
    process.exitCode = 0;
  } catch (error) {
    console.error("❌ SMTP verification failed");
    console.error("Code:", error.code || "N/A");
    console.error("Message:", error.message);
    process.exitCode = 1;
  }
};

testSMTP();