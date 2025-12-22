const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    pickup: {
      address: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
    },

    drop: {
      address: { type: String, required: true },
      contactName: { type: String, required: true },
      contactPhone: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "PICKED_UP", "ON_ROUTE", "DELIVERED"],
      default: "CREATED",
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pod: {
      photoUrl: { type: String, default: null },
      uploadedAt: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
