const Invite = require("../models/invite");

const createInvite = async (inviteData) => {
  const invite = new Invite(inviteData);
  await invite.save();
};

const validateInvite = async (qrCode) => {
  const invite = await Invite.findOne({ qrCode });
  if (invite) {
    invite.status = "confirmed";
    invite.confirmedAt = new Date();
    await invite.save();
    return true;
  }
  return false;
};

module.exports = {
  createInvite,
  validateInvite,
};
