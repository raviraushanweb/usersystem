import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import mongoose from "mongoose";

const userController = {
  async me(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.user._id }).select(
        "-password -updatedAt -__v"
      );
      if (!user) {
        return next(CustomErrorHandler.notFound("User doesn't exist!"));
      }
      res.status(200).json(user);
    } catch (err) {
      return next(err);
    }
  },

  async auser(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(CustomErrorHandler.objectIdNotValid());
      }
      const user = await User.findOne({ _id: req.params.id }).select(
        "name username profilePic coverPic followers following"
      );
      if (!user) {
        return next(CustomErrorHandler.notFound("User doesn't exist!"));
      }
      res.status(200).json(user);
    } catch (err) {
      return next(err);
    }
  },
};

export default userController;
