const mongoose = require("mongoose");

const signalementSchema = new mongoose.Schema(
  {
    // Type de signalement (utilisateur, annonce, message, avis)
    type: { 
      type: String, 
      enum: ["utilisateur", "annonce", "message", "avis"],
      required: true 
    },
    // ID de l'élément signalé
    targetId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    },
    // Utilisateur qui a fait le signalement
    reportedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    // Raison du signalement
    reason: { 
      type: String, 
      enum: [
        "spam",
        "contenu_inapproprie",
        "harcelement",
        "fausse_information",
        "arnaque",
        "comportement_suspect",
        "autre"
      ],
      required: true 
    },
    // Description détaillée
    description: { type: String, default: "" },
    // Statut du signalement
    status: { 
      type: String, 
      enum: ["nouveau", "en_cours", "traite", "rejete"],
      default: "nouveau"
    },
    // Action prise
    actionTaken: { 
      type: String, 
      enum: ["aucune", "avertissement", "suspension", "suppression", "rejet"],
      default: "aucune"
    },
    // Notes de l'admin
    adminNotes: { type: String, default: "" },
    // Admin qui a traité le signalement
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signalement", signalementSchema);
