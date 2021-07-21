const bcrypt = require("bcryptjs");
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
// transporter.verify(function(error, success) {
//   if (error) {
//        console.log(error);
//   } else {
//        console.log('Server is ready to take our messages');
//   }
// });

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

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
              //normaly dont need to do that save(), only in scenarios the session was created before
              console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid Email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
  // res.setHeader('Set-Cookie', 'loggeIn=true'); //Max-Age=10, Expires= http-date-format, Domain =, Secure, httpOnly->security layer forcross site attacks
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "error",
          "E-mail exists already, please pick a different one."
        );
        return res.redirect("/signup");
      }
      return bcrypt
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
    })
    .catch((err) => console.log("mail error", err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
