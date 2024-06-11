const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  qrCodeUrl: String,
  uniqueId: String, // Add this field
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});
const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;
