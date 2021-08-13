const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

exports.getAddProducts = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "add-product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: [],
    validationErrors: [],
  });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "add-product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: "Attached file is not an image.",
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
      hasError: true,
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user,
  });
  // console.log('product instance: ', product);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "add-product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
      hasError: true,
    });
  }

  product
    .save()
    .then((result) => {
      // console.log('product created');
      res.redirect("product-list");
    })
    .catch((err) => {
      // res.redirect("/500");

      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);

      return res.status(500).render("admin/edit-product", {
        pageTitle: "add-product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: "Database operation failed, please try again",
        product: {
          title: title,
          price: price,
          description: description,
        },
        validationErrors: [],
        hasError: true,
      });
    });
};

exports.getEditProducts = (req, res, next) => {
  const editMode = req.query.edit; //edit seria el nombre de la variable url, siempre devuelve el valor en string ya sea true o false
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "edit-product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: [],
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "edit-product",
      path: "/admin/add-product",
      editing: true,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      validationErrors: errors.array(),
      hasError: false,
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDescription;

      product.save().then((result) => {
        // console.log('updated product');
        res.redirect("/admin/product-list");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("product not found"));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then((result) => {
      // res.redirect("/admin/product-list");
      res.status(200).json({ message: "Success!" });
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
      res.status(500).json({message: "Deleting product failed!"});
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id }) //.select('a b -c') to select only (or exclude) the desired data -- .populate('userId', "name") to fecth all data relations include
    .then((products) => {
      // Product.findAll().then(products => {
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/admin/product-list",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
