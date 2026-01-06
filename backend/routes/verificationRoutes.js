const express = require("express");
const multer = require("multer");
const path = require("path");
const { getVerificationStatus, uploadDocument, validerDocument } = require("../controllers/verificationController");

const router = express.Router();

// Configuration de multer pour l'upload de documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents/");
  },
  filename: function (req, file, cb) {
    // Créer un nom unique pour le fichier
    const uniqueName = "doc-" + Date.now() + "-" + Math.round(Math.random() * 1000);
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  }
});

// Filtrer les fichiers (accepter images et PDF)
const fileFilter = function (req, file, cb) {
  const allowedTypes = [
    "image/jpeg", 
    "image/jpg", 
    "image/png", 
    "application/pdf"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. Utilisez JPG, PNG ou PDF."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10 MB
  }
});

// Routes
router.get("/:userId/status", getVerificationStatus);
router.post("/:userId/upload", upload.single("document"), uploadDocument);
router.put("/:userId/valider", validerDocument);

module.exports = router;
