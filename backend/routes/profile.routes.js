const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadImage.middleware");
const { getProfile, updateProfile } = require("../controller/updateProfile.controller");

router.get("/auth/profile/:account_id", getProfile);
//router.patch("/auth/profile/:account_id", upload.single("avatar"), updateProfile);
router.patch("/auth/profile/:account_id", updateProfile);

module.exports = router;