const express = require("express");
const {
  createAvisVolontaire,
  getAvisVolontaire,
  createAvisHote,
  getAvisHote,
  updateAvis,
  deleteAvis
} = require("../controllers/avisController");

const router = express.Router();

router.post("/volontaire", createAvisVolontaire);
router.get("/volontaire/:userId", getAvisVolontaire);
router.post("/hote", createAvisHote);
router.get("/hote/:userId", getAvisHote);
router.put("/:avisId", updateAvis);
router.delete("/:avisId", deleteAvis);

module.exports = router;
