const express = require("express");
const multer = require("multer");
const {
  uploadCSV,
  sendInvitations,
  validateInvite,
  decodeQRCode,
} = require("../controllers/inviteController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const store = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadCSV);
router.post("/send", sendInvitations);
router.post("/validate", validateInvite); // This should correctly reference the validateInvite method
router.post("/decode", store.single("file"), decodeQRCode); // Add new route for decoding

module.exports = router;
