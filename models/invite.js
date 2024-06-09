const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  name: String,
  phone: String,
  qrCodeUrl: String,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

module.exports = mongoose.model("Invite", inviteSchema);
