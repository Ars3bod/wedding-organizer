const axios = require("axios");
const Invite = require("../models/invite");
const { generateQRCode } = require("../utils/qrCodeGenerator");
const { parseCSV } = require("../utils/csvParser");
const twilioClient = require("../config/twilio");
const qrCode = require("qrcode");
const mongoose = require("mongoose");
const qrCodeGenerator = require("../utils/qrCodeGenerator");

// Function to upload image to imgbb
const uploadImageToImgBB = async (base64Image) => {
  // Ensure base64Image is a string before proceeding
  // if (typeof base64Image !== "string") {
  //   throw new Error("Base64 image is not a string");
  // }

  const apiKey = process.env.IMGBB_API_KEY; // Ensure this is set correctly
  const url = "https://api.imgbb.com/1/upload";

  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("image", base64Image.base64Image); // Remove the "data:image/png;base64," part

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

const uploadCSV = async (req, res) => {
  try {
    const filePath = req.file.path; // Get the file path from multer
    const invitees = await parseCSV(filePath);
    const savePromises = invitees.map(async (invitee) => {
      const uniqueId = new mongoose.Types.ObjectId().toString(); // Generate a unique ID
      const qrCode = await qrCodeGenerator.generateQRCode(uniqueId); // Generate QR code with the unique ID
      const qrCodeUrl = await uploadImageToImgBB(qrCode); // Upload QR code to ImgBB
      console.log("QR Code URL:", qrCodeUrl);

      const newInvite = new Invite({
        name: invitee.name,
        contactNumber: invitee.contactNumber,
        qrCodeUrl: qrCodeUrl, // Save the ImgBB URL
        uniqueId: uniqueId, // Save the unique ID
        status: "pending",
      });
      return newInvite.save();
    });

    await Promise.all(savePromises);
    res.status(200).json({
      message: "Invitations uploaded and QR codes generated successfully",
    });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendInvitations = async (req, res) => {
  try {
    const invites = await Invite.find();

    for (const invite of invites) {
      console.log(
        `Sending invitation to ${invite.contactNumber} with QR code URL: ${invite.qrCodeUrl}`
      );

      // Log the URL to check if it's valid
      if (!/^https?:\/\/.+/.test(invite.qrCodeUrl)) {
        console.error("Invalid URL format:", invite.qrCodeUrl);
        throw new Error("Invalid media URL format");
      }

      await twilioClient.messages.create({
        body: `Hi ${invite.name}! You're invited to our wedding. Please see the attached QR code.`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${invite.contactNumber}`,
        mediaUrl: [invite.qrCodeUrl], // Use the URL from ImgBB
      });
    }

    res.status(200).json({ message: "Invitations sent successfully" });
  } catch (error) {
    console.error("Error sending invitations:", error);
    res.status(500).json({ message: "Error sending invitations", error });
  }
};

// Validate QR code endpoint
// Validate invitation by unique ID
const validateInvite = async (req, res) => {
  try {
    const { uniqueId } = req.body; // Use uniqueId from the request body

    // Find the invitation with the given unique ID
    const invite = await Invite.findOne({ uniqueId });

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

module.exports = {
  uploadCSV,
  sendInvitations,
  uploadImageToImgBB,
  validateInvite,
};
