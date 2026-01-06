const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Créer le dossier uploads/documents pour les documents d'identité
const documentsDir = path.join(__dirname, "uploads/documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

app.set("io", io);

app.use(cors());

// Route webhook Stripe (doit être AVANT express.json())
// Le webhook Stripe a besoin du body brut pour vérifier la signature
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), require("./controllers/paymentController").handleWebhook);

app.use(express.json());

// Servir les fichiers uploadés (photos de profil)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
mongoose.connection.on("error", (e) => console.error("MongoDB connection error:", e.message));
mongoose.connection.once("open", () => console.log("MongoDB connection open"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("markAsRead", (data) => {
    // Notifier l'expediteur que le message a ete lu
    if (data.senderId) {
      io.to(data.senderId).emit("messageRead", {
        messageId: data.messageId,
        readBy: data.readBy
      });
    }
  });

  socket.on("typing", (data) => {
    // Notifier que l'utilisateur tape un message
    if (data.receiverId) {
      io.to(data.receiverId).emit("userTyping", {
        senderId: data.senderId,
        isTyping: data.isTyping
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/annonces", require("./routes/annonceRoutes"));
app.use("/api/candidatures", require("./routes/candidatureRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/avis", require("./routes/avisRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/verification", require("./routes/verificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/signalementRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));