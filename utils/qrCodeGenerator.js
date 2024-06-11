const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const generateQRCode = async (invite) => {
  try {
    const uniqueId = uuidv4(); // Generate a unique ID
    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({ ...invite, id: uniqueId })
    ); // Include the unique ID in the QR code data

    // Extract the base64 string from the data URL
    const base64Image = qrCodeData.split(",")[1];

    return { base64Image, uniqueId };
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

module.exports = { generateQRCode };
