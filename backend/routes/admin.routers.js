const express = require("express");
const router = express.Router();
const { listAccounts, updateAccountStatus } = require("../controller/listAccount.admin.controller");

router.get("/admin/accounts", listAccounts);
router.patch("/admin/accounts/:accountId", updateAccountStatus);

module.exports = router;