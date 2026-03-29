const Product = require('../models/productModel');
const { v4: uuidv4 } = require('uuid');

exports.index = async (req, res) => {
  const search = req.query.search || "";
  const data = await Product.getAll(search);
  res.render('index', { products: data.Items, search });
};

exports.createForm = (req, res) => res.render('create');

exports.create = async (req, res) => {
  const product = {
    id: uuidv4(),
    name: req.body.name,
    price: Number(req.body.price),
    unit_in_stock: Number(req.body.unit_in_stock),
    url_image: req.file.location
  };
  await Product.create(product);
  res.redirect('/');
};

exports.detail = async (req, res) => {
  const data = await Product.getById(req.params.id);
  res.render('detail', { product: data.Item });
};

exports.editForm = async (req, res) => {
  const data = await Product.getById(req.params.id);
  res.render('edit', { product: data.Item });
};

exports.update = async (req, res) => {
  const fileUrl = req.file
    ? req.file.location
    : req.body.oldImage;

  await Product.update(req.params.id, {
    name: req.body.name,
    price: Number(req.body.price),
    unit_in_stock: Number(req.body.unit_in_stock),
    url_image: fileUrl
  });

  res.redirect('/');
};

exports.delete = async (req, res) => {
  await Product.delete(req.params.id);
  res.redirect('/');
};