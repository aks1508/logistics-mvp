require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "client@demo.com";
  const plainPassword = "Client@123";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.passwordHash = await bcrypt.hash(plainPassword, 10);
    existing.role = "client";
    existing.isActive = true;
    await existing.save();
    console.log("Client already exists. Update password for:", existing.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const client = await User.create({
    name: "Client 1",
    email,
    passwordHash,
    role: "client",
    phone: "432157896",
  });

  console.log("Created Client:", client.email);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error", err.message);
  process.exit(1);
});
