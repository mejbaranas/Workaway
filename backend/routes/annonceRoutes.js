const express = require("express");
const {
  createAnnonce,
  listAnnonces,
  updateAnnonce,
  deleteAnnonce,
  pauseAnnonce
} = require("../controllers/annonceController");

const router = express.Router();

router.post("/", createAnnonce);
router.get("/", listAnnonces);

router.put("/:id", updateAnnonce);
router.delete("/:id", deleteAnnonce);
router.patch("/:id/pause", pauseAnnonce);

module.exports = router;
