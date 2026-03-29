const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { upload } = require('../config/upload');

router.get('/', productController.getProducts);

router.get('/add', productController.renderAddProduct);
router.post('/add', upload.single('image'), productController.addProduct);

router.get('/edit/:id', productController.renderEditProduct);
router.post('/edit/:id', upload.single('image'), productController.updateProduct);

router.post('/delete/:id', productController.deleteProduct);

module.exports = router;
