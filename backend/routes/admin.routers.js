const express = require("express");
const router = express.Router();
const { listAccounts } = require("../controller/listAccount.admin.controller");

router.get("/admin/accounts", listAccounts);

module.exports = router;