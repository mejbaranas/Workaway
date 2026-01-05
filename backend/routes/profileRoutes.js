const express = require("express");
const multer = require("multer");
const path = require("path");
const { getProfile, updateProfile, uploadPhoto } = require("../controllers/profileController");

const router = express.Router();

// Configuration de multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Créer un nom unique pour le fichier
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1000);
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  }
});

// Filtrer les fichiers (accepter seulement les images)
const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. Utilisez JPG, PNG ou GIF."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5 MB
  }
});

// Routes
router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);
router.post("/:userId/photo", upload.single("photo"), uploadPhoto);

module.exports = router;
