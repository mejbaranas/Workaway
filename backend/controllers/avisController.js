const mongoose = require("mongoose");
const Avis = require("../models/Avis");
const User = require("../models/User");
const Candidature = require("../models/Candidature");
const Annonce = require("../models/Annonce");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createAvisVolontaire(req, res) {
  try {
    const { author, target, note, commentaire } = req.body;

    if (!author || !target || !note || !commentaire) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (!isValidObjectId(author) || !isValidObjectId(target)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5" });
    }

    const targetUser = await User.findById(target);
    if (!targetUser) {
      return res.status(404).json({ message: "Volontaire introuvable" });
    }

    const existingAvis = await Avis.findOne({ author, target, type: "volontaire" });
    if (existingAvis) {
      return res.status(409).json({ message: "Vous avez déjà laissé un avis pour ce volontaire" });
    }

    const avis = await Avis.create({
      author,
      target,
      type: "volontaire",
      note: Number(note),
      commentaire: String(commentaire).trim()
    });

    const populatedAvis = await Avis.findById(avis._id)
      .populate("author", "firstName lastName")
      .populate("target", "firstName lastName");

    return res.status(201).json({ message: "Avis ajouté", avis: populatedAvis });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getAvisVolontaire(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const avis = await Avis.find({ target: userId, type: "volontaire" })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    const stats = await Avis.aggregate([
      { $match: { target: new mongoose.Types.ObjectId(userId), type: "volontaire" } },
      {
        $group: {
          _id: null,
          moyenne: { $avg: "$note" },
          total: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      avis,
      stats: stats[0] || { moyenne: 0, total: 0 }
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function createAvisHote(req, res) {
  try {
    const { author, target, note, commentaire } = req.body;

    // Verifier les champs obligatoires
    if (!author || !target || !note || !commentaire) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    // Verifier les IDs
    if (!isValidObjectId(author) || !isValidObjectId(target)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    // Verifier la note entre 1 et 5
    if (note < 1 || note > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5" });
    }

    // Verifier que l'hote existe
    const targetUser = await User.findById(target);
    if (!targetUser) {
      return res.status(404).json({ message: "Hôte introuvable" });
    }

    // Verifier que le sejour est termine (candidature acceptee avec date passee)
    const annoncesHote = await Annonce.find({ createdBy: target });
    const annonceIds = annoncesHote.map((a) => a._id);

    const sejourTermine = await Candidature.findOne({
      applicantId: author,
      annonceId: { $in: annonceIds },
      status: "accepted"
    });

    if (!sejourTermine) {
      return res.status(403).json({ message: "Vous devez avoir terminé un séjour pour laisser un avis" });
    }

    // Verifier si un avis existe deja
    const existingAvis = await Avis.findOne({ author, target, type: "hote" });
    if (existingAvis) {
      return res.status(409).json({ message: "Vous avez déjà laissé un avis pour cet hôte" });
    }

    // Creer l'avis
    const avis = await Avis.create({
      author,
      target,
      type: "hote",
      note: Number(note),
      commentaire: String(commentaire).trim()
    });

    const populatedAvis = await Avis.findById(avis._id)
      .populate("author", "firstName lastName")
      .populate("target", "firstName lastName");

    return res.status(201).json({ message: "Avis ajouté", avis: populatedAvis });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getAvisHote(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const avis = await Avis.find({ target: userId, type: "hote" })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    const stats = await Avis.aggregate([
      { $match: { target: new mongoose.Types.ObjectId(userId), type: "hote" } },
      {
        $group: {
          _id: null,
          moyenne: { $avg: "$note" },
          total: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      avis,
      stats: stats[0] || { moyenne: 0, total: 0 }
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function updateAvis(req, res) {
  try {
    const { avisId } = req.params;
    const { note, commentaire } = req.body;

    if (!isValidObjectId(avisId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const update = {};
    if (note !== undefined) {
      if (note < 1 || note > 5) {
        return res.status(400).json({ message: "La note doit être entre 1 et 5" });
      }
      update.note = Number(note);
    }
    if (commentaire !== undefined) {
      update.commentaire = String(commentaire).trim();
    }

    const avis = await Avis.findByIdAndUpdate(avisId, update, { new: true })
      .populate("author", "firstName lastName")
      .populate("target", "firstName lastName");

    if (!avis) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    return res.status(200).json({ message: "Avis modifié", avis });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function deleteAvis(req, res) {
  try {
    const { avisId } = req.params;

    if (!isValidObjectId(avisId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const avis = await Avis.findByIdAndDelete(avisId);

    if (!avis) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    return res.status(200).json({ message: "Avis supprimé" });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  createAvisVolontaire,
  getAvisVolontaire,
  createAvisHote,
  getAvisHote,
  updateAvis,
  deleteAvis
};
