const express = require("express");
const multer = require("multer");
const {
  uploadCSV,
  sendInvitations,
  validateInvite,
} = require("../controllers/inviteController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadCSV);
router.post("/send", sendInvitations);
router.post("/validate", validateInvite); // This should correctly reference the validateInvite method

module.exports = router;
