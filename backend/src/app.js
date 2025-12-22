const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const clientJobRoutes = require("./routes/clientJobRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/client", clientJobRoutes);
app.use("/admin", adminRoutes);
app.use(errorHandler);
//health check route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

module.exports = app;
