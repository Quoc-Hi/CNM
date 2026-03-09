const Product = require("../models/productModel")
const { v4: uuidv4 } = require("uuid")

exports.index = async (req,res)=>{
  const products = await Product.getAll()
  res.render("index",{products})
}

exports.createPage = (req,res)=>{
  res.render("create")
}

exports.create = async (req,res)=>{
  const product = {
    id: uuidv4(),
    name: req.body.name,
    price: req.body.price
  }

  await Product.create(product)

  res.redirect("/")
}

exports.delete = async (req,res)=>{
  await Product.delete(req.params.id)
  res.redirect("/")
}