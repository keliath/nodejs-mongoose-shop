const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("60f615b278f57f602ca14fad")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        //normaly dont need to do that, only in scenarios the session was created before
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
  // res.setHeader('Set-Cookie', 'loggeIn=true'); //Max-Age=10, Expires= http-date-format, Domain =, Secure, httpOnly->security layer forcross site attacks
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
