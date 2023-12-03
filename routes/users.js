const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

router.get("/", usersController.listUsers);
router.post("/", usersController.createUser);
router.post("/reset-password", usersController.resetAccountPassword);
router.put("/reset-confirm", usersController.confirmPasswordReset);
router.post("/verify", usersController.verifyAccount);
router.post("/login", usersController.loginUser);
router.get("/login", usersController.checkJwt);
router.get("/:id", usersController.readUser);
router.put("/:id", usersController.updateUser);
router.put("/change-password/:id", usersController.changePassword);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
