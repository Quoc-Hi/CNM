const express = require("express")
const router = express.Router()

const controller = require("../controllers/productController")

router.get("/",controller.index)

router.get("/create",controller.createPage)

router.post("/create",controller.create)

router.get("/delete/:id",controller.delete)

module.exports = router