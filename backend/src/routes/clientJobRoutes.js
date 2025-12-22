const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  createClientJob,
  listClientJobs,
  getClientJobById,
} = require("../controllers/jobController");

const router = express.Router();

router.post("/jobs", requireAuth, requireRole("client"), createClientJob);

router.get("/jobs", requireAuth, requireRole("client"), listClientJobs);

router.get("/jobs/:id", requireAuth, requireRole("client"), getClientJobById);

module.exports = router;
