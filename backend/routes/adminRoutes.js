const express = require("express");
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  suspendUser, 
  unsuspendUser,
  deleteUser 
} = require("../controllers/adminController");

const {
  getAllAnnonces,
  getReportedAnnonces,
  approveAnnonce,
  rejectAnnonce,
  reportAnnonce,
  clearReports,
  deleteAnnonce
} = require("../controllers/moderationController");

const {
  createSignalement,
  getAllSignalements,
  getSignalementStats,
  getSignalementById,
  processSignalement,
  markAsInProgress,
  deleteSignalement
} = require("../controllers/signalementController");

const router = express.Router();

// Routes pour la gestion des utilisateurs
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId", updateUser);
router.put("/users/:userId/suspend", suspendUser);
router.put("/users/:userId/unsuspend", unsuspendUser);
router.delete("/users/:userId", deleteUser);

// Routes pour la modération des annonces
router.get("/annonces", getAllAnnonces);
router.get("/annonces/reported", getReportedAnnonces);
router.put("/annonces/:annonceId/approve", approveAnnonce);
router.put("/annonces/:annonceId/reject", rejectAnnonce);
router.post("/annonces/:annonceId/report", reportAnnonce);
router.put("/annonces/:annonceId/clear-reports", clearReports);
router.delete("/annonces/:annonceId", deleteAnnonce);

// Routes pour la gestion des signalements
router.get("/reports", getAllSignalements);
router.get("/reports/stats", getSignalementStats);
router.get("/reports/:signalementId", getSignalementById);
router.post("/reports", createSignalement);
router.put("/reports/:signalementId/process", processSignalement);
router.put("/reports/:signalementId/in-progress", markAsInProgress);
router.delete("/reports/:signalementId", deleteSignalement);

module.exports = router;
