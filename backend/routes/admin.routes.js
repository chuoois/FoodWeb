const express = require("express");
const router = express.Router();
const { listAccounts, updateAccountStatus,updateAccountRole } = require("../controller/listAccount.admin.controller");
const {listShops, updateShopStatus} = require('../controller/admin/shop.admin.controller')
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

router.get("/admin/accounts",authenticate,authorize("ADMIN"), listAccounts);
router.patch("/admin/accounts/:accountId",authenticate,authorize("ADMIN"), updateAccountStatus);
router.get("/admin/shops",authenticate,authorize('ADMIN'), listShops);
router.patch("/admin/shops/:shopId",authenticate,authorize("ADMIN"), updateShopStatus);

router.patch("/admin/accounts/:accountId/role", authenticate, authorize("ADMIN"), updateAccountRole);


module.exports = router;
 