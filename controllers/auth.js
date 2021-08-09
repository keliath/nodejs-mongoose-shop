const crypto = require("crypto");
const bcrypt = require("bcryptjs");
// const { validationResult } = require("express-validator/check"); //deprecated /check
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
// const sendgrid = require('nodemailer-sendgrid'); //sendgrid

// const transporter = nodemailer.createTransport(sendgrid({
//   auth: {
//     api_user:
//     api_keu:
//   }
// }));

const USER_MAIL = "ae80ff045ae31e";
const USER_PASS = "ba244e17ce373c";
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: USER_MAIL,
    pass: USER_PASS,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("probando1");
    console.log(error);
  } else {
    console.log("probando2");
    console.log("Server is ready to take our messages");
  }
});

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
    },
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid Email or password.");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              //normaly dont need to do that save(), only in scenarios weree session was created before
              console.log("e".err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid Email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log("err".err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
  // res.setHeader('Set-Cookie', 'loggeIn=true'); //Max-Age=10, Expires= http-date-format, Domain =, Secure, httpOnly->security layer forcross site attacks
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      const mailOptions = {
        from: '"Example Team" <shop@example.com>',
        to: email, //"user1@example.com, user2@example.com",
        subject: "Nice Nodemailer test",
        text: "Hey there, it’s our first message sent with Nodemailer ;) ",
        html: "<b>Hey there! </b><br> This is our first message sent with Nodemailer; you succesfull signup!",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });
      res.redirect("/login");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        const mailOptions = {
          from: '"Example Team" <shop@example.com>',
          to: req.body.email, //"user1@example.com, user2@example.com",
          subject: "Nice Nodemailer test",
          text: "Password reset) ",
          html: `
          <b>Hey there! </b><br> This is our first message sent with Nodemailer; you succesfull signup!
          <a href='http://localhost:3000/reset/${token}'>link</a>
          `,
        };

        res.redirect("/");
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log(user);
      res.render("auth/new-password", {
        path: "/reset",
        pageTitle: "New Password",
        errorMessage: req.flash("error"),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
