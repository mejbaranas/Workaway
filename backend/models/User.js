const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    // Champ pour le rôle utilisateur
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    // Champ pour la suspension du compte
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedReason: { type: String, default: "" },
    // Nouveaux champs pour le profil
    bio: { type: String, default: "", maxlength: 500 },
    langues: [{ type: String, trim: true }],
    competences: [{ type: String, trim: true }],
    photo: { type: String, default: "" },
    // Champs pour la vérification d'identité
    documentIdentite: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { 
      type: String, 
      enum: ["non_soumis", "en_attente", "verifie", "refuse"],
      default: "non_soumis"
    },
    verificationDate: { type: Date },
    // Champs pour l'abonnement premium
    isPremium: { type: Boolean, default: false },
    premiumPlan: { 
      type: String, 
      enum: ["gratuit", "mensuel", "annuel"],
      default: "gratuit"
    },
    premiumUntil: { type: Date },
    stripeCustomerId: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);