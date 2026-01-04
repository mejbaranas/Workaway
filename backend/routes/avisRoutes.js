const express = require("express");
const {
  createAvisVolontaire,
  getAvisVolontaire,
  updateAvis,
  deleteAvis
} = require("../controllers/avisController");

const router = express.Router();

router.post("/volontaire", createAvisVolontaire);
router.get("/volontaire/:userId", getAvisVolontaire);
router.put("/:avisId", updateAvis);
router.delete("/:avisId", deleteAvis);

module.exports = router;
