const mongoose = require("mongoose");
const Candidature = require("../models/Candidature");
const Annonce = require("../models/Annonce");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function applyToAnnonce(req, res) {
  try {
    const { annonceId, applicantId, message } = req.body;

    if (!annonceId || !applicantId || !message) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (!isValidObjectId(annonceId) || !isValidObjectId(applicantId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    const existing = await Candidature.findOne({ annonceId, applicantId });
    if (existing) {
      return res.status(409).json({ message: "Vous avez déjà postulé" });
    }

    const candidature = await Candidature.create({
      annonceId,
      applicantId,
      message: String(message).trim()
    });

    return res.status(201).json({ message: "Candidature envoyée", candidature });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function listCandidaturesByAnnonce(req, res) {
  try {
    const { annonceId } = req.params;

    if (!isValidObjectId(annonceId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const candidatures = await Candidature.find({ annonceId }).sort({ createdAt: -1 });

    return res.status(200).json({ candidatures });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function listDemandesRecues(req, res) {
  try {
    const { annonceId } = req.params;
    const { hostId } = req.query;

    if (!annonceId || !hostId) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (!isValidObjectId(annonceId) || !isValidObjectId(hostId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    const createdBy = annonce.createdBy ? annonce.createdBy.toString() : null;
    if (!createdBy || createdBy !== hostId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const candidatures = await Candidature.find({ annonceId }).sort({ createdAt: -1 });

    return res.status(200).json({ candidatures });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { applyToAnnonce, listCandidaturesByAnnonce, listDemandesRecues };
