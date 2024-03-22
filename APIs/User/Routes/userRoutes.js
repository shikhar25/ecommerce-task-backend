const express = require("express");
const router = express.Router();
const userController = require("../Controller/userController");

router.post("/signUp", userController.signUp);
router.post("/signIn", userController.signIn);
router.get("/get-user", userController.getUser);
router.post("/passwordResetMail", userController.passwordResetMail);
router.patch("/forgotpassword/:id", userController.forgotPassword);

module.exports = router;
