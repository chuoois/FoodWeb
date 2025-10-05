const express = require("express");
const router = express.Router();
const { listAccounts, updateAccountStatus } = require("../controller/listAccount.admin.controller");
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

router.get("/admin/accounts",authenticate,authorize("ADMIN"), listAccounts);
router.patch("/admin/accounts/:accountId",authenticate,authorize("ADMIN"), updateAccountStatus);

module.exports = router;
