const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  qrCodeUrl: String,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
  },
});

const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;
