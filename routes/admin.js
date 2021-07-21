const express = require("express");

const adminController = require("../controllers/admin.js");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProducts);

router.get("/product-list", isAuth, adminController.getProducts);

router.post("/add-product", isAuth, adminController.postAddProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProducts);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
