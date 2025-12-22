require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "driver1@demo.com";
  const plainPassword = "Driver@123";

  const existing = await User.findOne({ email });
  //if the driver is already present then just update the password
  if (existing) {
    const newHash = await bcrypt.hash(plainPassword, 10);
    existing.passwordHash = newHash;
    existing.role = "driver";
    await existing.save();
    console.log("Driver already exists. Updated password for:", existing.email);
    process.exit(0);
  }
  //If not present create a new password and driver user.
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const driver = await User.create({
    name: "Driver 1",
    email,
    passwordHash,
    role: "driver",
    phone: "0987654321",
  });
  console.log("Created Driver:", driver.email);
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed Error:", e.message);
  process.exit(1);
});
