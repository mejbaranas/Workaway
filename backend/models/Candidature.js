const mongoose = require("mongoose");

const candidatureSchema = new mongoose.Schema(
  {
    annonceId: { type: mongoose.Schema.Types.ObjectId, ref: "Annonce", required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, minlength: 5 },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidature", candidatureSchema);
