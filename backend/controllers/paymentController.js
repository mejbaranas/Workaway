const Stripe = require("stripe");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Prix des plans (à configurer dans Stripe Dashboard)
const PLANS = {
  mensuel: {
    price: 999, // 9.99€ en centimes
    name: "Abonnement Mensuel",
    duration: 30 // jours
  },
  annuel: {
    price: 7999, // 79.99€ en centimes
    name: "Abonnement Annuel",
    duration: 365 // jours
  }
};

// Créer une session Stripe Checkout
async function createCheckoutSession(req, res) {
  try {
    const { userId, plan } = req.body;

    // Vérifier les champs obligatoires
    if (!userId || !plan) {
      return res.status(400).json({ message: "userId et plan sont requis" });
    }

    // Vérifier que le plan est valide
    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Plan invalide. Choisir: mensuel ou annuel" });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Créer ou récupérer le client Stripe
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: userId }
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: PLANS[plan].name,
              description: `Accès premium WorkAway - ${plan}`
            },
            unit_amount: PLANS[plan].price
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/paiement-reussi?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/paiement-annule`,
      metadata: {
        userId: userId,
        plan: plan
      }
    });

    // Enregistrer l'abonnement en attente
    await Subscription.create({
      userId: userId,
      plan: plan,
      status: "en_attente",
      stripeCustomerId: customerId,
      stripeSessionId: session.id,
      amount: PLANS[plan].price,
      currency: "eur"
    });

    return res.status(200).json({
      message: "Session créée",
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.log("Erreur Stripe:", error.message);
    return res.status(500).json({ message: "Erreur lors de la création du paiement" });
  }
}

// Webhook Stripe pour gérer les événements
async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Erreur signature webhook:", error.message);
    return res.status(400).json({ message: "Signature invalide" });
  }

  // Traiter les différents événements
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutComplete(event.data.object);
      break;
    case "payment_intent.succeeded":
      console.log("Paiement réussi:", event.data.object.id);
      break;
    case "payment_intent.payment_failed":
      console.log("Paiement échoué:", event.data.object.id);
      break;
    default:
      console.log("Événement non géré:", event.type);
  }

  return res.status(200).json({ received: true });
}

// Traiter le paiement réussi
async function handleCheckoutComplete(session) {
  try {
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    // Calculer la date de fin
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].duration);

    // Mettre à jour l'abonnement
    await Subscription.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: "actif",
        startDate: startDate,
        endDate: endDate
      }
    );

    // Activer le premium pour l'utilisateur
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumPlan: plan,
      premiumUntil: endDate
    });

    console.log(`Premium activé pour ${userId} jusqu'au ${endDate}`);
  } catch (error) {
    console.log("Erreur traitement paiement:", error.message);
  }
}

// Vérifier le statut de l'abonnement
async function getSubscriptionStatus(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("isPremium premiumPlan premiumUntil");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le premium est expiré
    let isPremiumActive = false;
    if (user.isPremium && user.premiumUntil) {
      isPremiumActive = new Date(user.premiumUntil) > new Date();
      
      // Si expiré, désactiver le premium
      if (!isPremiumActive) {
        await User.findByIdAndUpdate(userId, {
          isPremium: false,
          premiumPlan: "gratuit"
        });
      }
    }

    // Récupérer l'historique des abonnements
    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      message: "Statut récupéré",
      isPremium: isPremiumActive,
      plan: isPremiumActive ? user.premiumPlan : "gratuit",
      premiumUntil: user.premiumUntil,
      subscriptions: subscriptions
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Annuler un abonnement
async function cancelSubscription(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId requis" });
    }

    // Désactiver le premium
    await User.findByIdAndUpdate(userId, {
      isPremium: false,
      premiumPlan: "gratuit"
    });

    // Marquer les abonnements actifs comme annulés
    await Subscription.updateMany(
      { userId: userId, status: "actif" },
      { status: "annule" }
    );

    return res.status(200).json({
      message: "Abonnement annulé"
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Vérifier une session après paiement (pour la page de succès)
async function verifySession(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return res.status(200).json({
        message: "Paiement vérifié",
        success: true,
        plan: session.metadata.plan
      });
    } else {
      return res.status(200).json({
        message: "Paiement non confirmé",
        success: false
      });
    }
  } catch {
    return res.status(500).json({ message: "Erreur vérification" });
  }
}

// Récupérer les plans disponibles
async function getPlans(req, res) {
  try {
    const plans = [
      {
        id: "gratuit",
        name: "Gratuit",
        price: 0,
        features: [
          "Consulter les annonces",
          "Créer un profil",
          "5 candidatures par mois"
        ]
      },
      {
        id: "mensuel",
        name: "Premium Mensuel",
        price: 9.99,
        duration: "mois",
        features: [
          "Candidatures illimitées",
          "Badge vérifié",
          "Messagerie prioritaire",
          "Voir qui a vu votre profil",
          "Support prioritaire"
        ]
      },
      {
        id: "annuel",
        name: "Premium Annuel",
        price: 79.99,
        duration: "an",
        savings: "2 mois offerts",
        features: [
          "Candidatures illimitées",
          "Badge vérifié",
          "Messagerie prioritaire",
          "Voir qui a vu votre profil",
          "Support prioritaire",
          "Accès anticipé aux nouvelles annonces"
        ]
      }
    ];

    return res.status(200).json({
      message: "Plans récupérés",
      plans: plans
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  verifySession,
  getPlans
};
