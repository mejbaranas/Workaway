const mongoose = require("mongoose");

const disponibiliteSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ["available", "blocked"], default: "available" }
}, { _id: true });

// Schema pour les signalements
const signalementSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const annonceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, required: true, trim: true, minlength: 10 },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    disponibilites: [disponibiliteSchema],
    // Champs pour la modération
    moderationStatus: { 
      type: String, 
      enum: ["en_attente", "approuvee", "rejetee"],
      default: "en_attente"
    },
    moderatedAt: { type: Date },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String, default: "" },
    // Champs pour les signalements
    isReported: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    signalements: [signalementSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Annonce", annonceSchema);