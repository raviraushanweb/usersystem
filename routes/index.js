import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  refreshController,
  userController,
  deleteProfile,
  updateProfile,
  usernameCheck,
  follow,
  unfollow,
  verifyProfile,
  forgotPassword,
  resetPassword,
} from "../controllers";

import auth from "../middlewares/auth";

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/userProfile/me", auth, userController.me);
router.get("/userProfile/user/:id", auth, userController.auser);
router.post("/refresh", refreshController.refresh);
router.post("/logout", auth, loginController.logout);

router.delete("/profile/deleteProfile/:id", auth, deleteProfile.delete);
router.patch("/profile/updateProfile/:id", auth, updateProfile.update);
router.post("/profile/usernameCheck", usernameCheck.isAvailable);
router.post("/profile/verifyProfile/:id", auth, verifyProfile.sendVerification);
router.get("/confirmation/:token", verifyProfile.acceptVerification);
router.post("/forgotPassword/", forgotPassword);
router.post("/resetPassword/:id/:token", resetPassword);

router.patch("/social/follow/:id", auth, follow.follow);
router.patch("/social/unfollow/:id", auth, unfollow.unfollow);

export default router;
