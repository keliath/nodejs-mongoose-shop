const express = require('express');

const adminController = require('../controllers/admin.js');

const router = express.Router();


router.get('/add-product', adminController.getAddProducts);

router.get('/product-list', adminController.getProducts);

router.post('/add-product', adminController.postAddProducts);

router.get('/edit-product/:productId', adminController.getEditProducts);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;