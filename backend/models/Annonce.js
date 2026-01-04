const mongoose = require("mongoose");

const disponibiliteSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ["available", "blocked"], default: "available" }
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
    disponibilites: [disponibiliteSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Annonce", annonceSchema);
