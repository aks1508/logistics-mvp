const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  createJob,
  assignDriver,
  updateStatus,
  listJobs,
  getJobById,
  uploadPodPhoto,
} = require("../controllers/jobController");
const upload = require("../config/upload");
// const { uploadPodPhoto } = require("../controllers/jobController");

const router = express.Router();

// router.get("/ping", (req, res) => res.json({ ok: true, route: "jobs" }));

// admin-only create job
router.post("/", requireAuth, requireRole("admin"), createJob);

router.patch(
  "/:id/assign-driver",
  requireAuth,
  requireRole("admin"),
  assignDriver
);

router.patch("/:id/status", requireAuth, requireRole("driver"), updateStatus);

// Admin + Driver can list jobs (filtered in controller)
router.get("/", requireAuth, requireRole("admin", "driver"), listJobs);

// Admin + Driver can view job details (restricted in controller)
router.get("/:id", requireAuth, requireRole("admin", "driver"), getJobById);

router.post(
  "/:id/pod/photo",
  requireAuth,
  requireRole("driver"),
  upload.single("photo"),
  uploadPodPhoto
);

module.exports = router;
