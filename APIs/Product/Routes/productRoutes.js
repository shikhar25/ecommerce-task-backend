const express = require('express');
const router = express.Router();
const productController = require('../Controller/productController');
const auth = require('../../../config/authJwt')

router.post('/addProduct', auth, productController.addProduct);
router.get('/getAllProducts', auth, productController.getAllProducts);
router.get('/getProduct/:id', auth, productController.getProduct);
router.put('/updateProduct/:id', auth, productController.updateProduct);
router.delete('/deleteProduct/:id', auth, productController.deleteProduct);

module.exports = router;
