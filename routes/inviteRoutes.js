const express = require("express");
const multer = require("multer");
const inviteController = require("../controllers/inviteController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), inviteController.sendInvitations);
router.post("/validate", inviteController.validateInvite);

module.exports = router;
