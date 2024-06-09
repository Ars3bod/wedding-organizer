const QRCode = require("qrcode");

const generateQRCode = async (text) => {
  try {
    const qrCode = await QRCode.toDataURL(text);
    return qrCode;
  } catch (err) {
    throw new Error("Error generating QR code: " + err.message);
  }
};

module.exports = {
  generateQRCode,
};
