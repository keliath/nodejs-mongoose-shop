const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "add-product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postAddProducts = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user,
    });
    // console.log('product instance: ', product);
    product.save().then(result => {
        // console.log('product created');
        res.redirect('product-list');
    }).catch(err => console.log(err));
};

exports.getEditProducts = (req, res, next) => {
    const editMode = req.query.edit; //edit seria el nombre de la variable url, siempre devuelve el valor en string ya sea true o false
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: "edit-product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
            isAuthenticated: req.session.isLoggedIn
        });
    }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;

    Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDescription;

        return product.save();
    }).then(result => {
        // console.log('updated product');
        res.redirect('/admin/product-list');
    }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId).then(result => {
        res.redirect('/admin/product-list');
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.find() //.select('a b -c') to select only (or exclude) the desired data -- .populate('userId', "name") to fecth all data relations include
        .then(products => {
            // Product.findAll().then(products => {
            res.render('admin/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: '/admin/product-list',
                isAuthenticated: req.session.isLoggedIn
            });
        }).catch(err => console.log(err));
};