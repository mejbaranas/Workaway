const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Destinataire de la notification
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    // Type de notification
    type: { 
      type: String, 
      enum: [
        "message",
        "candidature",
        "candidature_acceptee",
        "candidature_refusee",
        "nouvel_avis",
        "annonce_approuvee",
        "annonce_rejetee",
        "verification",
        "signalement",
        "systeme"
      ],
      required: true 
    },
    // Titre de la notification
    title: { 
      type: String, 
      required: true 
    },
    // Message détaillé
    message: { 
      type: String, 
      required: true 
    },
    // Notification lue ou non
    isRead: { 
      type: Boolean, 
      default: false 
    },
    // Lien vers la page concernée (optionnel)
    link: { 
      type: String, 
      default: "" 
    },
    // Données supplémentaires (ID de l'annonce, message, etc.)
    relatedId: { 
      type: mongoose.Schema.Types.ObjectId 
    },
    // Expéditeur (optionnel, pour les messages)
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

// Index pour améliorer les performances
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);