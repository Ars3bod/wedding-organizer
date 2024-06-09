const inviteService = require("../services/inviteService");
const qrCodeGenerator = require("../utils/qrCodeGenerator");
const csvParser = require("../utils/csvParser");
const twilioClient = require("../config/twilio");

//const { sendWhatsAppInvitation } = require("../services/inviteService");

const sendInvitations = async (req, res) => {
  try {
    const invitees = await csvParser.parseCSV(req.file.path);
    for (const invitee of invitees) {
      // Add code to generate QR code here
      // Assuming qrCode is generated and stored in invitee.qrCode

      // Send WhatsApp invitation
      await sendWhatsAppInvitation(invitee);

      // Add code to save invitee details to the database
    }
    res.status(200).send("Invitations sent successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const validateInvite = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const isValid = await inviteService.validateInvite(qrCode);
    res.status(200).json({ valid: isValid });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const sendWhatsAppInvitation = async (invitee) => {
  try {
    const message = await twilioClient.messages.create({
      body: `Hi ${invitee.name}! You're invited to our wedding. Please see the attached QR code.`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${invitee.contactNumber}`,
      mediaUrl: [invitee.qrCode], // Assuming qrCode is a URL to the generated QR code
    });

    console.log(`WhatsApp invitation sent to ${invitee.name}: ${message.sid}`);
  } catch (error) {
    console.error("Error sending WhatsApp invitation:", error);
  }
};

module.exports = {
  sendInvitations,
  validateInvite,
  sendWhatsAppInvitation,
};
