const Job = require("../models/Job");
const User = require("../models/User");

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      createdBy: req.user._id,
      clientName: req.body.clientName,
      pickup: req.body.pickup,
      drop: req.body.drop,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver Id is required" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver" || !driver.isActive) {
      return res.status(400).json({ message: "Invalid Driver ID" });
    }

    const job = await Job.findById(jobId);
    if (!job)
      return res
        .status(400)
        .json({ message: "Job not found. Enter correct Job ID" });

    job.assignedDriver = driver._id;
    job.status = "ASSIGNED";
    await job.save();

    return res.json(job);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const ALLOWED_NEXT = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["ON_ROUTE"],
  ON_ROUTE: ["DELIVERED"],
  DELIVERED: [],
  CREATED: ["ASSIGNED"], // normally admin sets ASSIGNED
};

exports.updateStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "status is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.assignedDriver) {
      return res.status(400).json({ message: "Job has no assigned driver" });
    }

    // Only assigned driver can update
    if (job.assignedDriver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowed = ALLOWED_NEXT[job.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition: ${job.status} -> ${status}`,
      });
    }

    job.status = status;
    await job.save();

    return res.json(job);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "driver") {
      filter = { assignedDriver: req.user._id };
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 }) // ✅ Mongoose sort
      .select(
        "clientName pickup drop status assignedDriver createdBy createdAt updatedAt"
      )
      .populate("assignedDriver", "name email phone role")
      .populate("createdBy", "name email role");

    return res.json(jobs);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .select(
        "clientName pickup drop status assignedDriver createdBy pod createdAt updatedAt"
      )
      .populate("assignedDriver", "name email phone role")
      .populate("createdBy", "name email role");

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Admin can view any job
    if (req.user.role === "admin") return res.json(job);

    // Driver can view only their assigned job
    if (req.user.role === "driver") {
      if (!job.assignedDriver) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const assignedId = job.assignedDriver._id.toString();
      if (assignedId !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return res.json(job);
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.createClientJob = async (req, res) => {
  try {
    const job = await Job.create({
      createdBy: req.user._id,
      clientName: req.user.name || "Client",
      pickup: req.body.pickup,
      drop: req.body.drop,
      status: "CREATED",
    });

    return res.status(200).json(job);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.listClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        "clientName pickup drop status assignedDriver createdAt updatedAt "
      );
    return res.json(jobs);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getClientJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .select(
        "clientName pickup drop status assignedDriver createdBy pod createdAt updatedAt"
      )
      .populate("assignedDriver", "name email phone role phone")
      .populate("createdBy", "name email role");

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ownership check: only the client who created it can view it
    const createdById = job.createdBy?._id?.toString();
    if (!createdById || createdById !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(job);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.uploadPodPhoto = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.assignedDriver) {
      return res.status(400).json({ message: "Job has no assigned driver" });
    }

    // only allow POD upload once job is in progress or delivered
    if (!["PICKED_UP", "ON_ROUTE", "DELIVERED"].includes(job.status)) {
      return res.status(400).json({
        message: "POD upload not allowed at this status",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    // prevent overwrite
    if (job.pod && job.pod.photoUrl) {
      return res.status(400).json({ message: "POD already uploaded" });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    job.pod = {
      photoUrl,
      uploadedAt: new Date(),
    };

    await job.save();

    // Optional (but nice): return the updated job so frontend can just setJob()
    return res.json({
      message: "POD photo uploaded",
      job: job, // or return only pod+jobId if you prefer
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
