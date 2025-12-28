const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());

// ✅ MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB error ❌", err));

// ✅ ROUTES
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from backend",
    status: "success"
  });
});


// ✅ SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
