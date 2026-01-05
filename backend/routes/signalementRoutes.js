const express = require("express");
const { createSignalement } = require("../controllers/signalementController");

const router = express.Router();

// Route publique pour créer un signalement
router.post("/", createSignalement);

module.exports = router;
