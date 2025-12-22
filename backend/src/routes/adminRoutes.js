const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const { listUsers } = require("../controllers/adminController");

const router = express.Router();

router.get("/users", requireAuth, requireRole("admin"), listUsers);

module.exports = router;
