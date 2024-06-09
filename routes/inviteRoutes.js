const express = require("express");
const multer = require("multer");
const {
  uploadCSV,
  sendInvitations,
} = require("../controllers/inviteController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadCSV);
router.post("/send", sendInvitations);

module.exports = router;
