const express = require("express");
const { connectDB } = require("./config/db");
const inviteRoutes = require("./routes/inviteRoutes");
const twilio = require("./config/twilio");
const app = express();

require("dotenv").config();

connectDB();

app.use(express.json());
app.use("/api/invites", inviteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
