require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@demo.com";
  const plainPassword = "Admin@123";

  const existing = await User.findOne({ email });

  if (existing) {
    const newHash = await bcrypt.hash(plainPassword, 10);
    existing.passwordHash = newHash;
    await existing.save();
    console.log("Admin already exists, Updated password for:", existing.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "admin",
    phone: "1234567890",
  });

  console.log("Created Admin:", admin.email);
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed error:", e.message);
  process.exit(1);
});
