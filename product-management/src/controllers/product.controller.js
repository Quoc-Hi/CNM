const { v4: uuidv4 } = require("uuid");
const dynamo = require("../services/dynamo.service");
const s3svc = require("../services/s3.service");

exports.renderList = async (req, res) => {
  const products = await dynamo.listProducts();
  res.render("products/list", { products });
};

exports.renderAdd = (req, res) => {
  res.render("products/add");
};

exports.create = async (req, res) => {
  const { name, price, quantity } = req.body;
  const id = uuidv4();

  let url_image = "";
  if (req.file) {
    const up = await s3svc.uploadImage(req.file);
    url_image = up.url;
  }

  await dynamo.createProduct({
    id,
    name,
    price: Number(price),
    quantity: Number(quantity),
    url_image,
  });

  res.redirect("/products");
};

exports.renderEdit = async (req, res) => {
  const product = await dynamo.getProductById(req.params.id);
  if (!product) return res.status(404).send("Not found");
  res.render("products/edit", { product });
};

exports.update = async (req, res) => {
  const { name, price, quantity } = req.body;
  const id = req.params.id;

  const old = await dynamo.getProductById(id);
  if (!old) return res.status(404).send("Not found");

  const data = {
    name,
    price: price !== undefined ? Number(price) : undefined,
    quantity: quantity !== undefined ? Number(quantity) : undefined,
  };

  // nếu có ảnh mới -> upload ảnh mới, (khuyến khích) xóa ảnh cũ
  if (req.file) {
    const up = await s3svc.uploadImage(req.file);
    data.url_image = up.url;

    if (old.url_image) {
      const oldKey = s3svc.extractKeyFromUrl(old.url_image);
      await s3svc.deleteImageByKey(oldKey);
    }
  }

  await dynamo.updateProduct(id, data);
  res.redirect("/products");
};

exports.remove = async (req, res) => {
  const id = req.params.id;
  const old = await dynamo.getProductById(id);

  await dynamo.deleteProduct(id);

  if (old?.url_image) {
    const key = s3svc.extractKeyFromUrl(old.url_image);
    await s3svc.deleteImageByKey(key);
  }

  res.redirect("/products");
};
