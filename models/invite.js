const { Schema, model } = require("mongoose");

const inviteSchema = new Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String },
  qrCode: { type: String, required: true },
  status: { type: String, default: "sent" },
  invitationSentAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date, default: null },
});

const Invite = model("Invite", inviteSchema);

module.exports = Invite;
