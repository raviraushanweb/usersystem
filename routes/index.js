import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  refreshController,
  userController,
} from "../controllers";

import auth from "../middlewares/auth";

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/userProfile", auth, userController.me);
router.post("/refresh", refreshController.refresh);
router.post("/logout", auth, loginController.logout);

export default router;
