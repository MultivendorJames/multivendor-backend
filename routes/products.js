const express = require("express");
const router = express.Router();

const upload = require("../libs/multer");
const productsController = require("../controllers/products");

router.get("/", productsController.listProducts);
router.post("/", upload.single("image"), productsController.createProduct);
router.get("/:id", productsController.readProduct);
router.put("/:id", upload.single("image"), productsController.updateProduct);
router.put("/views/:id", productsController.updateViews);
router.delete("/:id", productsController.deleteProduct);

module.exports = router;
