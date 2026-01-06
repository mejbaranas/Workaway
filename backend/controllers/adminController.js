const User = require("../models/User");

// Récupérer tous les utilisateurs
async function getAllUsers(req, res) {
  try {
    // Récupérer tous les utilisateurs (sans le mot de passe)
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Liste des utilisateurs récupérée",
      count: users.length,
      users: users
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer un utilisateur par ID
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Utilisateur récupéré",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Modifier les informations d'un utilisateur
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, role, bio, langues, competences } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Préparer les données à mettre à jour
    const updateData = {};

    if (firstName) {
      updateData.firstName = firstName.trim();
    }
    if (lastName) {
      updateData.lastName = lastName.trim();
    }
    if (email) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(409).json({ message: "Cet email est déjà utilisé" });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (role && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }
    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }
    if (langues !== undefined) {
      updateData.langues = langues;
    }
    if (competences !== undefined) {
      updateData.competences = competences;
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
      message: "Utilisateur mis à jour",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Suspendre un compte utilisateur
async function suspendUser(req, res) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedReason: reason || "Aucune raison spécifiée"
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Compte suspendu avec succès",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Réactiver un compte utilisateur
async function unsuspendUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isSuspended: false,
        suspendedAt: null,
        suspendedReason: ""
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Compte réactivé avec succès",
      user: user
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Supprimer un utilisateur
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Utilisateur supprimé avec succès"
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  suspendUser, 
  unsuspendUser,
  deleteUser 
};
