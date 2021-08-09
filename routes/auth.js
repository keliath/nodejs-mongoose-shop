const express = require("express");

const authController = require("../controllers/auth");

// const validator = require('express-validator');
const { check, body, validationResult } = require("express-validator");

const router = express.Router();

const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email.").isEmail(),
    body(
      "password",
      "the password must be at least 4 characters and only contains only numbers and text"
    )
      .isLength({ min: 4, max: 16 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Invalid email.")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("this email is forbidden");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail already exist, please pick a different one."
            );
          }
        });
      }), //custom for custom validators

    body(
      "password",
      "the password must be at least 4 characters and only contains only numbers and text"
    ) //deault message in the check constructor
      // unlike check, body too check but only the fields inside body req
      .isLength({ min: 4, max: 16 })
      .isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
