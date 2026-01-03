const express = require("express");
const {
  createAnnonce,
  listAnnonces,
  searchHotes,
  getAnnonceById,
  updateAnnonce,
  deleteAnnonce,
  pauseAnnonce
} = require("../controllers/annonceController");

const router = express.Router();

router.get("/", listAnnonces);
router.get("/search", searchHotes);
router.get("/:id", getAnnonceById);

router.post("/", createAnnonce);
router.put("/:id", updateAnnonce);
router.delete("/:id", deleteAnnonce);
router.patch("/:id/pause", pauseAnnonce);

module.exports = router;
