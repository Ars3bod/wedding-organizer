const QRCode = require("qrcode");

const generateQRCode = async (text) => {
  try {
    const qrCodeData = await QRCode.toDataURL(text);
    return qrCodeData;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

module.exports = { generateQRCode };
