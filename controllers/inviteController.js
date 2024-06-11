const axios = require("axios");
const Invite = require("../models/invite");
const { generateQRCode } = require("../utils/qrCodeGenerator");
const { parseCSV } = require("../utils/csvParser");
const twilioClient = require("../config/twilio");
const qrCode = require("qrcode");
const mongoose = require("mongoose");
const qrCodeGenerator = require("../utils/qrCodeGenerator");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");

// Function to upload image to imgbb
const uploadImageToImgBB = async (base64Image) => {
  const apiKey = process.env.IMGBB_API_KEY; // Ensure this is set correctly
  const url = "https://api.imgbb.com/1/upload";

  // Check if the API key is set
  if (!apiKey) {
    throw new Error("IMGBB_API_KEY is not set in the environment variables.");
  }

  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("image", base64Image);

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
      const { base64Image, uniqueId } = await generateQRCode(
        invitee.contactNumber
      );
      const qrCodeUrl = await uploadImageToImgBB(base64Image); // Upload QR code to ImgBB
      console.log("QR Code URL:", qrCodeUrl);

      const newInvite = new Invite({
        name: invitee.name,
        contactNumber: invitee.contactNumber,
        qrCodeUrl: qrCodeUrl, // Save the ImgBB URL
        uniqueId: uniqueId, // Save the unique ID
      });
      return newInvite.save();
    });

    await Promise.all(savePromises);
    res
      .status(200)
      .json({ message: "CSV uploaded and QR codes generated successfully" });
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
    const { uniqueId } = req.body;

    // Find the invitation with the given unique ID
    const invite = await Invite.findOne({ uniqueId });

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Check if the invitation status is already 'completed'
    if (invite.status === "completed") {
      return res
        .status(500)
        .json({ message: "The invitation expired", invite });
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

// Decode QR code endpoint
const decodeQRCode = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const buffer = file.buffer;

    const image = await Jimp.read(buffer);

    const decodedData = await new Promise((resolve, reject) => {
      const qr = new QrCode();
      qr.callback = (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value.result);
        }
      };
      qr.decode(image.bitmap);
    });

    res.status(200).json({ decodedData });
  } catch (error) {
    console.error("Error decoding QR code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadCSV,
  sendInvitations,
  uploadImageToImgBB,
  validateInvite,
  decodeQRCode,
};
