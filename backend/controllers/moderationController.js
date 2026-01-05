const Annonce = require("../models/Annonce");

// Récupérer toutes les annonces pour modération
async function getAllAnnonces(req, res) {
  try {
    const { status } = req.query; // Filtrer par moderationStatus

    let filter = {};
    if (status && ["en_attente", "approuvee", "rejetee"].includes(status)) {
      filter.moderationStatus = status;
    }

    const annonces = await Annonce.find(filter)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Annonces récupérées",
      count: annonces.length,
      annonces: annonces
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer les annonces signalées
async function getReportedAnnonces(req, res) {
  try {
    const annonces = await Annonce.find({ isReported: true })
      .populate("createdBy", "firstName lastName email")
      .populate("signalements.reportedBy", "firstName lastName")
      .sort({ reportCount: -1 });

    return res.status(200).json({
      message: "Annonces signalées récupérées",
      count: annonces.length,
      annonces: annonces
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Approuver une annonce
async function approveAnnonce(req, res) {
  try {
    const { annonceId } = req.params;
    const { adminId } = req.body;

    if (!annonceId) {
      return res.status(400).json({ message: "ID annonce manquant" });
    }

    const annonce = await Annonce.findByIdAndUpdate(
      annonceId,
      {
        moderationStatus: "approuvee",
        moderatedAt: new Date(),
        moderatedBy: adminId || null,
        status: "active"
      },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    return res.status(200).json({
      message: "Annonce approuvée avec succès",
      annonce: annonce
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Rejeter une annonce
async function rejectAnnonce(req, res) {
  try {
    const { annonceId } = req.params;
    const { adminId, reason } = req.body;

    if (!annonceId) {
      return res.status(400).json({ message: "ID annonce manquant" });
    }

    const annonce = await Annonce.findByIdAndUpdate(
      annonceId,
      {
        moderationStatus: "rejetee",
        moderatedAt: new Date(),
        moderatedBy: adminId || null,
        rejectionReason: reason || "Non conforme aux règles",
        status: "paused"
      },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    return res.status(200).json({
      message: "Annonce rejetée",
      annonce: annonce
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Signaler une annonce (pour les utilisateurs)
async function reportAnnonce(req, res) {
  try {
    const { annonceId } = req.params;
    const { userId, reason, description } = req.body;

    if (!annonceId) {
      return res.status(400).json({ message: "ID annonce manquant" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Raison du signalement manquante" });
    }

    // Ajouter le signalement
    const annonce = await Annonce.findByIdAndUpdate(
      annonceId,
      {
        $push: {
          signalements: {
            reportedBy: userId,
            reason: reason,
            description: description || ""
          }
        },
        $inc: { reportCount: 1 },
        isReported: true
      },
      { new: true }
    );

    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    return res.status(200).json({
      message: "Annonce signalée avec succès",
      reportCount: annonce.reportCount
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Effacer les signalements d'une annonce (après vérification)
async function clearReports(req, res) {
  try {
    const { annonceId } = req.params;

    if (!annonceId) {
      return res.status(400).json({ message: "ID annonce manquant" });
    }

    const annonce = await Annonce.findByIdAndUpdate(
      annonceId,
      {
        isReported: false,
        reportCount: 0,
        signalements: []
      },
      { new: true }
    );

    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    return res.status(200).json({
      message: "Signalements effacés",
      annonce: annonce
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Supprimer une annonce
async function deleteAnnonce(req, res) {
  try {
    const { annonceId } = req.params;

    if (!annonceId) {
      return res.status(400).json({ message: "ID annonce manquant" });
    }

    const annonce = await Annonce.findByIdAndDelete(annonceId);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    return res.status(200).json({
      message: "Annonce supprimée avec succès"
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  getAllAnnonces,
  getReportedAnnonces,
  approveAnnonce,
  rejectAnnonce,
  reportAnnonce,
  clearReports,
  deleteAnnonce
};
