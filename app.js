const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const db = require("./config/db");
const inviteRoutes = require("./routes/inviteRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
db.connect();

// Routes
app.use("/api/invites", inviteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
