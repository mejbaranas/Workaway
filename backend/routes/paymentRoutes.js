const express = require("express");
const {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  verifySession,
  getPlans
} = require("../controllers/paymentController");

const router = express.Router();

// Récupérer les plans disponibles
router.get("/plans", getPlans);

// Créer une session de paiement Stripe
router.post("/create-checkout", createCheckoutSession);

// Vérifier le statut d'abonnement d'un utilisateur
router.get("/status/:userId", getSubscriptionStatus);

// Vérifier une session après paiement
router.get("/verify/:sessionId", verifySession);

// Annuler un abonnement
router.post("/cancel", cancelSubscription);

// Webhook Stripe (route spéciale - le body doit être raw)
// Cette route sera configurée dans server.js avec express.raw()

module.exports = router;
