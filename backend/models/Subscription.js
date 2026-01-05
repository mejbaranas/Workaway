const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // Utilisateur associé
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    // Plan d'abonnement
    plan: { 
      type: String, 
      enum: ["gratuit", "mensuel", "annuel"],
      default: "gratuit"
    },
    // Statut de l'abonnement
    status: { 
      type: String, 
      enum: ["actif", "annule", "expire", "en_attente"],
      default: "en_attente"
    },
    // ID client Stripe
    stripeCustomerId: { 
      type: String, 
      default: "" 
    },
    // ID abonnement Stripe
    stripeSubscriptionId: { 
      type: String, 
      default: "" 
    },
    // ID de la session de paiement Stripe
    stripeSessionId: { 
      type: String, 
      default: "" 
    },
    // Date de début
    startDate: { 
      type: Date 
    },
    // Date de fin
    endDate: { 
      type: Date 
    },
    // Montant payé (en centimes)
    amount: { 
      type: Number, 
      default: 0 
    },
    // Devise
    currency: { 
      type: String, 
      default: "eur" 
    }
  },
  { timestamps: true }
);

// Index pour améliorer les performances
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
