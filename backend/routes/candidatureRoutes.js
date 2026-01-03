const express = require("express");
const { applyToAnnonce, listCandidaturesByAnnonce } = require("../controllers/candidatureController");

const router = express.Router();

router.post("/", applyToAnnonce);
router.get("/annonce/:annonceId", listCandidaturesByAnnonce);

module.exports = router;
