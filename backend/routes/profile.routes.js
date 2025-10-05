const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadImage.middleware");
const { getProfile, updateProfile } = require("../controller/updateProfile.controller");
const authenticate = require('../middleware/authenticate.middleware')

const checkOwner = (req, res, next) => {
  const { accountId } = req.user;
  const targetAccountId = req.params.account_id;

  if (accountId !== targetAccountId) {
    return res.status(403).json({ message: "No access" });
  }
  next();
};

router.get("/auth/profile/:account_id", authenticate,checkOwner, getProfile);
//router.patch("/auth/profile/:account_id", upload.single("avatar"), updateProfile);
router.patch("/auth/profile/:account_id",authenticate,checkOwner, updateProfile);

module.exports = router;