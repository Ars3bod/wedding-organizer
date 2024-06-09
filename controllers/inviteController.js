const axios = require("axios");
const Invite = require("../models/invite");
const { generateQRCode } = require("../utils/qrCodeGenerator");
const { parseCSV } = require("../utils/csvParser");
const twilioClient = require("../config/twilio");
const Invite = require("../models/invite");
const qrCode = require("qrcode");

// Function to upload image to imgbb
const uploadImageToImgBB = async (base64Image) => {
  const apiKey = process.env.IMGBB_API_KEY; // Ensure this is set correctly
  const url = "https://api.imgbb.com/1/upload";

  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("image", base64Image.split(",")[1]); // Remove the "data:image/png;base64," part

  try {
    const response = await axios.post(url, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Log the response to verify the URL
    console.log("ImgBB Response:", response.data);

    return response.data.data.url;
  } catch (error) {
    console.error("Error uploading image to ImgBB:", error);
    throw error;
  }
};

// Validate QR code endpoint
exports.validateInvite = async (req, res) => {
  try {
    const { qrCodeUrl } = req.body;

    // Find the invitation with the given QR code URL
    const invite = await Invite.findOne({ qrCodeUrl });

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Update the status to 'completed'
    invite.status = "completed";
    await invite.save();

    res
      .status(200)
      .json({ message: "Invitation validated successfully", invite });
  } catch (error) {
    console.error("Error validating invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const uploadCSV = async (req, res) => {
  try {
    const filePath = req.file.path; // Get the file path from multer
    const invitees = await parseCSV(filePath);

    const savePromises = invitees.map(async (invitee) => {
      const qrCode = await generateQRCode(invitee.contactNumber);
      const qrCodeUrl = await uploadImageToImgBB(qrCode); // Upload QR code to ImgBB
      console.log("QR Code URL:", qrCodeUrl);

      const newInvite = new Invite({
        name: invitee.name,
        contactNumber: invitee.contactNumber,
        qrCode: qrCodeUrl, // Save the ImgBB URL
      });
      return newInvite.save();
    });

    await Promise.all(savePromises);

    res.status(200).json({ message: "Invitations stored successfully" });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    res.status(500).json({ message: "Error uploading CSV", error });
  }
};

const sendInvitations = async (req, res) => {
  try {
    const invites = await Invite.find();

    for (const invite of invites) {
      console.log(
        `Sending invitation to ${invite.contactNumber} with QR code URL: ${invite.qrCode}`
      );

      // Log the URL to check if it's valid
      if (!/^https?:\/\/.+/.test(invite.qrCode)) {
        console.error("Invalid URL format:", invite.qrCode);
        throw new Error("Invalid media URL format");
      }

      await twilioClient.messages.create({
        body: `Hi ${invite.name}! You're invited to our wedding. Please see the attached QR code.`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${invite.contactNumber}`,
        mediaUrl: [invite.qrCode], // Use the URL from ImgBB
      });
    }

    res.status(200).json({ message: "Invitations sent successfully" });
  } catch (error) {
    console.error("Error sending invitations:", error);
    res.status(500).json({ message: "Error sending invitations", error });
  }
};

module.exports = {
  uploadCSV,
  sendInvitations,
  uploadImageToImgBB,
};
