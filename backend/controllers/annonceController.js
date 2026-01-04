const mongoose = require("mongoose");
const Annonce = require("../models/Annonce");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createAnnonce(req, res) {
  try {
    const { title, description, city, country, startDate, endDate, createdBy } = req.body;

    if (!title || !description || !city || !country) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const annonce = await Annonce.create({
      title: String(title).trim(),
      description: String(description).trim(),
      city: String(city).trim(),
      country: String(country).trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      createdBy: createdBy || undefined
    });

    return res.status(201).json({ message: "Annonce créée", annonce });
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

async function searchHotes(req, res) {
  try {
    const { q, city, country } = req.query;

    const filter = { status: "active" };

    if (city) filter.city = new RegExp(String(city).trim(), "i");
    if (country) filter.country = new RegExp(String(country).trim(), "i");

    if (q && String(q).trim().length > 0) {
      const term = String(q).trim();
      filter.$or = [{ title: new RegExp(term, "i") }, { description: new RegExp(term, "i") }];
    }

    const annonces = await Annonce.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ annonces });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getAnnonceById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(id);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    return res.status(200).json({ annonce });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function updateAnnonce(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const { title, description, city, country, startDate, endDate } = req.body;

    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (city !== undefined) update.city = String(city).trim();
    if (country !== undefined) update.country = String(country).trim();
    if (startDate !== undefined) update.startDate = startDate || undefined;
    if (endDate !== undefined) update.endDate = endDate || undefined;

    const annonce = await Annonce.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    return res.status(200).json({ message: "Annonce modifiée", annonce });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function deleteAnnonce(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findByIdAndDelete(id);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    return res.status(200).json({ message: "Annonce supprimée" });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function pauseAnnonce(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(id);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    annonce.status = annonce.status === "paused" ? "active" : "paused";
    await annonce.save();

    return res.status(200).json({
      message: annonce.status === "paused" ? "Annonce mise en pause" : "Annonce réactivée",
      annonce
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function getCalendrier(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(id).select("disponibilites title");

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    return res.status(200).json({ 
      title: annonce.title,
      disponibilites: annonce.disponibilites || [] 
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function addDisponibilite(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate, type } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Dates requises" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    const annonce = await Annonce.findById(id);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    const newDisponibilite = {
      startDate: start,
      endDate: end,
      type: type || "available"
    };

    annonce.disponibilites.push(newDisponibilite);
    await annonce.save();

    return res.status(201).json({ 
      message: type === "blocked" ? "Dates bloquées" : "Disponibilité ajoutée",
      disponibilites: annonce.disponibilites 
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function removeDisponibilite(req, res) {
  try {
    const { id, dispoId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(dispoId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(id);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    const dispoIndex = annonce.disponibilites.findIndex(
      (d) => d._id.toString() === dispoId
    );

    if (dispoIndex === -1) {
      return res.status(404).json({ message: "Disponibilité introuvable" });
    }

    annonce.disponibilites.splice(dispoIndex, 1);
    await annonce.save();

    return res.status(200).json({ 
      message: "Disponibilité supprimée",
      disponibilites: annonce.disponibilites 
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function updateDisponibilite(req, res) {
  try {
    const { id, dispoId } = req.params;
    const { startDate, endDate, type } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(dispoId)) {
      return res.status(400).json({ message: "Id invalide" });
    }

    const annonce = await Annonce.findById(id);

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable" });
    }

    const dispo = annonce.disponibilites.id(dispoId);

    if (!dispo) {
      return res.status(404).json({ message: "Disponibilité introuvable" });
    }

    if (startDate) dispo.startDate = new Date(startDate);
    if (endDate) dispo.endDate = new Date(endDate);
    if (type) dispo.type = type;

    await annonce.save();

    return res.status(200).json({ 
      message: "Disponibilité modifiée",
      disponibilites: annonce.disponibilites 
    });
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = {
  createAnnonce,
  listAnnonces,
  searchHotes,
  getAnnonceById,
  updateAnnonce,
  deleteAnnonce,
  pauseAnnonce,
  getCalendrier,
  addDisponibilite,
  removeDisponibilite,
  updateDisponibilite
};
