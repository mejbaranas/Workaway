const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["volontaire", "hote"], required: true },
    note: { type: Number, required: true, min: 1, max: 5 },
    commentaire: { type: String, required: true, trim: true, minlength: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avis", avisSchema);
