const express = require("express");
const router = express.Router();
const user = require("../middlewares/user.middleware");

const upload = require("../libs/multer");
const productsController = require("../controllers/products");

router.get("/", productsController.listProducts);
router.post("/", user, upload.single("image"), productsController.createProduct);
router.get("/:id", productsController.readProduct);
router.put("/:id", user, upload.single("image"), productsController.updateProduct);
router.put("/views/:id", productsController.updateViews);
router.delete("/:id", user, productsController.deleteProduct);

module.exports = router;
