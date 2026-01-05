const User = require("../models/User");

// Récupérer le profil d'un utilisateur
async function getProfile(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Chercher l'utilisateur (sans le mot de passe)
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Profil récupéré",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Modifier le profil d'un utilisateur
async function updateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { bio, langues, competences } = req.body;

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Préparer les données à mettre à jour
    const updateData = {};

    // Validation de la bio (max 500 caractères)
    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({ message: "La bio ne peut pas dépasser 500 caractères" });
      }
      updateData.bio = bio.trim();
    }

    // Validation des langues (tableau de strings)
    if (langues !== undefined) {
      if (!Array.isArray(langues)) {
        return res.status(400).json({ message: "Les langues doivent être un tableau" });
      }
      // Nettoyer et filtrer les langues vides
      updateData.langues = langues
        .map(langue => langue.trim())
        .filter(langue => langue.length > 0);
    }

    // Validation des compétences (tableau de strings)
    if (competences !== undefined) {
      if (!Array.isArray(competences)) {
        return res.status(400).json({ message: "Les compétences doivent être un tableau" });
      }
      // Nettoyer et filtrer les compétences vides
      updateData.competences = competences
        .map(competence => competence.trim())
        .filter(competence => competence.length > 0);
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Profil mis à jour",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Upload de la photo de profil
async function uploadPhoto(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier que l'ID est fourni
    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucune photo fournie" });
    }

    // Créer le chemin de la photo
    const photoPath = "/uploads/" + req.file.filename;

    // Mettre à jour la photo de l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      { photo: photoPath },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Photo mise à jour",
      photo: photoPath,
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { getProfile, updateProfile, uploadPhoto };
