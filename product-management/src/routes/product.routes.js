const express = require("express");
const multer = require("multer");
const controller = require("../controllers/product.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", controller.renderList);
router.get("/add", controller.renderAdd);
router.post("/add", upload.single("image"), controller.create);

router.get("/:id/edit", controller.renderEdit);
router.put("/:id", upload.single("image"), controller.update);

router.delete("/:id", controller.remove);

module.exports = router;
