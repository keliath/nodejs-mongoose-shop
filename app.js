const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");

require("dotenv").config();

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
  //expire:,moreOsptions:
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views"); //type views it wouldnt necessary because its already the deafult value

const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorsController = require("./controllers/errors");

console.log(process.env.NODE_ENV);

app.use(helmet());
// app.use(compression());   //just in case hosting provider dont support their own compression-or use your own server

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  }) // , cookie{optios:}
);

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(new Date().toISOString());
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Browsers will by default try to request /favicon.ico from the root of a hostname, in order to show an icon in the browser tab.
// If you want to avoid this request returning a 404, you can either:
app.get("/favicon.ico", (req, res, next) => {
  res.status(204);
  // next();
}); //with this the console with not print twice

//updated bodyParser for parse body request
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
); // storage have more options that dest
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error("dummy error");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err)); //inside promise next instead throw
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorsController.error500);

app.use(errorsController.error404);

// app.use((error, req, res, next) => {
//   // res.status(error.httpStatusCode).render{...}
//   // res.redirect("/500");

//   res.status(500).render("500", {
//     pageTitle: "500 error",
//     path: "500",
//     isAuthenticated: req.session.isLoggedIn,
//   });
// });

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
