const express = require("express");
const { createAnnonce, listAnnonces } = require("../controllers/annonceController");

const router = express.Router();

router.post("/", createAnnonce);
router.get("/", listAnnonces);

module.exports = router;
