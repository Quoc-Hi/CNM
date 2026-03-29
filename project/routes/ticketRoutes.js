const express = require("express");
const router = express.Router();

const controller = require("../controllers/ticketController");
const upload = require("../middlewares/upload");

router.get("/", controller.getAll);
router.get("/add", controller.showAddForm);
router.post("/add", upload.single("image"), controller.create);

router.get("/delete/:id", controller.delete);

router.get("/edit/:id", controller.showEditForm);
router.post("/edit/:id", upload.single("image"), controller.update);

module.exports = router;