const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API Node.js fonctionne 🚀");
});

// Routes (exemple)
// const userRoutes = require("./routes/user.routes");
// app.use("/api/users", userRoutes);

module.exports = app;
