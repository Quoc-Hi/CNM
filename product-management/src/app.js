const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const morgan = require("morgan");
require("dotenv").config();

const productRoutes = require("./routes/product.routes");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.get("/", (req, res) => res.redirect("/products"));
app.use("/products", productRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
