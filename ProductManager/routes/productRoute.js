const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', ctrl.index);

router.get('/create', ctrl.createForm);
router.post('/create', upload.single('image'), ctrl.create);

router.get('/detail/:id', ctrl.detail);

router.get('/edit/:id', ctrl.editForm);
router.post('/edit/:id', upload.single('image'), ctrl.update);

router.get('/delete/:id', ctrl.delete);

module.exports = router;