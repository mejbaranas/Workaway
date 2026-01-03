const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
mongoose.connection.on("error", (e) => console.error("MongoDB connection error:", e.message));
mongoose.connection.once("open", () => console.log("MongoDB connection open"));
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/annonces", require("./routes/annonceRoutes"));
app.use("/api/candidatures", require("./routes/candidatureRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
