const express = require("express");
const {
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
} = require("../controllers/annonceController");

const router = express.Router();

router.get("/", listAnnonces);
router.get("/search", searchHotes);
router.get("/:id", getAnnonceById);
router.get("/:id/calendrier", getCalendrier);

router.post("/", createAnnonce);
router.post("/:id/calendrier", addDisponibilite);

router.put("/:id", updateAnnonce);
router.put("/:id/calendrier/:dispoId", updateDisponibilite);

router.delete("/:id", deleteAnnonce);
router.delete("/:id/calendrier/:dispoId", removeDisponibilite);

router.patch("/:id/pause", pauseAnnonce);

module.exports = router;
