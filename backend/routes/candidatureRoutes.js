const express = require("express");
const {
  applyToAnnonce,
  listCandidaturesByAnnonce,
  listDemandesRecues
} = require("../controllers/candidatureController");

const router = express.Router();

router.post("/", applyToAnnonce);
router.get("/annonce/:annonceId", listCandidaturesByAnnonce);
router.get("/annonce/:annonceId/recues", listDemandesRecues);

module.exports = router;
