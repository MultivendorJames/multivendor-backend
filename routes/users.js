const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const user = require("../middlewares/user.middleware");
const admin = require("../middlewares/admin.middleware");

router.get("/", user, admin, usersController.listUsers);
router.post("/", usersController.createUser);
router.post("/reset-password", usersController.resetAccountPassword);
router.put("/reset-confirm", usersController.confirmPasswordReset);
router.post("/verify", usersController.verifyAccount);
router.post("/login", usersController.loginUser);
router.get("/login", user, usersController.checkJwt);
router.get("/:id", user, admin, usersController.readUser);
router.put("/:id", usersController.updateUser);
router.put("/change-password/:id", usersController.changePassword);
router.delete("/:id", user, usersController.deleteUser);
router.post("/withdraw-funds", user, usersController.withdrawFunds);

module.exports = router;
