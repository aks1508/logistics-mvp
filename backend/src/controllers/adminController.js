const User = require("../models/User");

exports.listUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select("name email role phone isActive createdAt updatedAt");

    return res.json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
