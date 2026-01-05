const Signalement = require("../models/Signalement");
const User = require("../models/User");
const Annonce = require("../models/Annonce");

// Créer un signalement (pour les utilisateurs)
async function createSignalement(req, res) {
  try {
    const { type, targetId, reportedBy, reason, description } = req.body;

    // Vérifier les champs obligatoires
    if (!type || !targetId || !reportedBy || !reason) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Vérifier que le type est valide
    const typesValides = ["utilisateur", "annonce", "message", "avis"];
    if (!typesValides.includes(type)) {
      return res.status(400).json({ message: "Type de signalement invalide" });
    }

    // Créer le signalement
    const signalement = await Signalement.create({
      type,
      targetId,
      reportedBy,
      reason,
      description: description || ""
    });

    return res.status(201).json({
      message: "Signalement créé avec succès",
      signalement: signalement
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer tous les signalements (admin)
async function getAllSignalements(req, res) {
  try {
    const { status, type } = req.query;

    // Construire le filtre
    let filter = {};
    if (status && ["nouveau", "en_cours", "traite", "rejete"].includes(status)) {
      filter.status = status;
    }
    if (type && ["utilisateur", "annonce", "message", "avis"].includes(type)) {
      filter.type = type;
    }

    const signalements = await Signalement.find(filter)
      .populate("reportedBy", "firstName lastName email")
      .populate("processedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Signalements récupérés",
      count: signalements.length,
      signalements: signalements
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer les statistiques des signalements
async function getSignalementStats(req, res) {
  try {
    const total = await Signalement.countDocuments();
    const nouveau = await Signalement.countDocuments({ status: "nouveau" });
    const enCours = await Signalement.countDocuments({ status: "en_cours" });
    const traite = await Signalement.countDocuments({ status: "traite" });
    
    const parType = {
      utilisateur: await Signalement.countDocuments({ type: "utilisateur" }),
      annonce: await Signalement.countDocuments({ type: "annonce" }),
      message: await Signalement.countDocuments({ type: "message" }),
      avis: await Signalement.countDocuments({ type: "avis" })
    };

    return res.status(200).json({
      message: "Statistiques récupérées",
      stats: {
        total,
        nouveau,
        enCours,
        traite,
        parType
      }
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer un signalement par ID avec détails
async function getSignalementById(req, res) {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findById(signalementId)
      .populate("reportedBy", "firstName lastName email")
      .populate("processedBy", "firstName lastName");

    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    // Récupérer les détails de l'élément signalé
    let targetDetails = null;
    if (signalement.type === "utilisateur") {
      targetDetails = await User.findById(signalement.targetId)
        .select("firstName lastName email isSuspended");
    } else if (signalement.type === "annonce") {
      targetDetails = await Annonce.findById(signalement.targetId)
        .populate("createdBy", "firstName lastName");
    }

    return res.status(200).json({
      message: "Signalement récupéré",
      signalement: signalement,
      targetDetails: targetDetails
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Traiter un signalement (admin)
async function processSignalement(req, res) {
  try {
    const { signalementId } = req.params;
    const { action, adminNotes, adminId } = req.body;

    if (!signalementId) {
      return res.status(400).json({ message: "ID signalement manquant" });
    }

    // Vérifier l'action
    const actionsValides = ["avertissement", "suspension", "suppression", "rejet"];
    if (!action || !actionsValides.includes(action)) {
      return res.status(400).json({ message: "Action invalide" });
    }

    // Récupérer le signalement
    const signalement = await Signalement.findById(signalementId);
    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    // Appliquer l'action selon le type
    if (action === "suspension" && signalement.type === "utilisateur") {
      await User.findByIdAndUpdate(signalement.targetId, {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedReason: `Signalement traité: ${signalement.reason}`
      });
    } else if (action === "suppression") {
      if (signalement.type === "annonce") {
        await Annonce.findByIdAndDelete(signalement.targetId);
      }
    }

    // Mettre à jour le signalement
    const updatedSignalement = await Signalement.findByIdAndUpdate(
      signalementId,
      {
        status: action === "rejet" ? "rejete" : "traite",
        actionTaken: action,
        adminNotes: adminNotes || "",
        processedBy: adminId || null,
        processedAt: new Date()
      },
      { new: true }
    ).populate("reportedBy", "firstName lastName email");

    return res.status(200).json({
      message: `Signalement traité avec action: ${action}`,
      signalement: updatedSignalement
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Marquer un signalement comme en cours
async function markAsInProgress(req, res) {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findByIdAndUpdate(
      signalementId,
      { status: "en_cours" },
      { new: true }
    );

    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    return res.status(200).json({
      message: "Signalement marqué en cours",
      signalement: signalement
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Supprimer un signalement
async function deleteSignalement(req, res) {
  try {
    const { signalementId } = req.params;

    const signalement = await Signalement.findByIdAndDelete(signalementId);

    if (!signalement) {
      return res.status(404).json({ message: "Signalement non trouvé" });
    }

    return res.status(200).json({
      message: "Signalement supprimé"
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  createSignalement,
  getAllSignalements,
  getSignalementStats,
  getSignalementById,
  processSignalement,
  markAsInProgress,
  deleteSignalement
};
