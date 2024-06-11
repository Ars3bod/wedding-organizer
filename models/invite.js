const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  qrCode: String, // Base64 encoded QR code
});

const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;
