const express = require("express");
const {
  applyToAnnonce,
  getMyCandidatures,
  updateCandidatureStatus,
  listCandidaturesByAnnonce,
  listDemandesRecues
} = require("../controllers/candidatureController");

const router = express.Router();

router.post("/", applyToAnnonce);
router.get("/me/:userId", getMyCandidatures);
router.patch("/:candidatureId/status", updateCandidatureStatus);
router.get("/annonce/:annonceId", listCandidaturesByAnnonce);
router.get("/annonce/:annonceId/recues", listDemandesRecues);

module.exports = router;
