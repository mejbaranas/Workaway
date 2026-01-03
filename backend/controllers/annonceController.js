const Annonce = require("../models/Annonce");

async function createAnnonce(req, res) {
  try {
    const { title, description, city, country, startDate, endDate, createdBy } = req.body;

    if (!title || !description || !city || !country) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const annonce = await Annonce.create({
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      country: country.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      createdBy: createdBy || undefined
    });

    return res.status(201).json({
      message: "Annonce créée",
      annonce
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function listAnnonces(req, res) {
  try {
    const annonces = await Annonce.find().sort({ createdAt: -1 });
    return res.status(200).json({ annonces });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { createAnnonce, listAnnonces };
