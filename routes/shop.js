const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.get("/", shopController.getHome);
router.get("/products", shopController.getProducts);

router.get("/product/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteItem);

router.get("/orders", isAuth, shopController.getOrders);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);
router.post("/create-order", isAuth, shopController.postOrder);

// // router.get('/checkout', shopController.getCheckout);

module.exports = router;
