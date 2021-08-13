const express = require("express");

const adminController = require("../controllers/admin.js");
const isAuth = require("../middleware/is-auth");

const { body } = require("express-validator");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProducts);

router.get("/product-list", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  isAuth,
  [
    body(
      "title",
      "empty title or not valid title, title must contain atleast 4 characters"
    )
      .isString()
      .isLength({ min: 4 })
      .notEmpty()
      .trim(),
    body("price", "empty or not valid price, price must be a numeric value")
      .notEmpty()
      .isFloat(),
    body(
      "description",
      "empty description, min 5 characters and max 400 characters"
    )
      .notEmpty()
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postAddProducts
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProducts);

router.post(
  "/edit-product",
  isAuth,
  [
    body(
      "title",
      "empty or not valid title, title must contain atleast 4 characters"
    )
      .isString()
      .isLength({ min: 4 })
      .notEmpty()
      .trim(),
    body("price", "empty or not valid price, price must be a numeric value")
      .notEmpty()
      .isFloat(),
    body(
      "description",
      "empty description, min 5 characters and max 400 characters"
    )
      .notEmpty()
      .isLength({ min: 5, max: 400 })
      .trim(),
  ],
  adminController.postEditProduct
);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
