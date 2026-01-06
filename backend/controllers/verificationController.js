const User = require("../models/User");

// Récupérer le statut de vérification
async function getVerificationStatus(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Chercher l'utilisateur
    const user = await User.findById(userId).select("isVerified verificationStatus documentIdentite verificationDate");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Statut récupéré",
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      hasDocument: user.documentIdentite ? true : false,
      verificationDate: user.verificationDate
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Soumettre un document d'identité
async function uploadDocument(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun document fourni" });
    }

    // Créer le chemin du document
    const documentPath = "/uploads/documents/" + req.file.filename;

    // Mettre à jour l'utilisateur avec le document
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        documentIdentite: documentPath,
        verificationStatus: "en_attente",
        isVerified: false
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Document soumis avec succès. En attente de vérification.",
      verificationStatus: user.verificationStatus,
      documentIdentite: documentPath
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Valider un document (pour admin)
async function validerDocument(req, res) {
  try {
    const { userId } = req.params;
    const { decision } = req.body; // "accepter" ou "refuser"

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Vérifier la décision
    if (!decision || !["accepter", "refuser"].includes(decision)) {
      return res.status(400).json({ message: "Décision invalide. Utilisez 'accepter' ou 'refuser'" });
    }

    // Préparer les données selon la décision
    let updateData = {};
    if (decision === "accepter") {
      updateData = {
        isVerified: true,
        verificationStatus: "verifie",
        verificationDate: new Date()
      };
    } else {
      updateData = {
        isVerified: false,
        verificationStatus: "refuse",
        verificationDate: new Date()
      };
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: decision === "accepter" ? "Identité vérifiée" : "Document refusé",
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      verificationDate: user.verificationDate
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { getVerificationStatus, uploadDocument, validerDocument };
