const express = require("express")
const path = require("path")

const app = express()

// middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// cấu hình view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// dữ liệu demo
let products = [
  { id: 1, name: "Iphone", price: 1000, url_image: "https://via.placeholder.com/100" },
  { id: 2, name: "Laptop", price: 1500, url_image: "https://via.placeholder.com/100" }
]

// Home page
app.get("/", (req, res) => {
  res.render("index", { products })
})

// Form add product
app.get("/add", (req, res) => {
  res.render("add")
})

// Add product
app.post("/add", (req, res) => {
  const { name, price, url_image } = req.body

  const product = {
    id: Date.now(),
    name,
    price,
    url_image
  }

  products.push(product)

  res.redirect("/")
})

// Delete product
app.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id)

  products = products.filter(p => p.id !== id)

  res.redirect("/")
})

// chạy server
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})