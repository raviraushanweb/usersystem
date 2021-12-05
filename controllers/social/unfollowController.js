import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import mongoose from "mongoose";

const unfollowController = {
  async unfollow(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(CustomErrorHandler.objectIdNotValid());
    }

    if (req.user._id !== req.params.id) {
      try {
        const anotherUser = await User.findById(req.params.id);
        if (!anotherUser) {
          return next(CustomErrorHandler.notFound("User doesn't exist!"));
        }
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
          return next(CustomErrorHandler.notFound("User doesn't exist!"));
        }
        if (anotherUser.followers.includes(req.user._id)) {
          await anotherUser.updateOne({ $pull: { followers: req.user._id } });
          await currentUser.updateOne({ $pull: { following: req.params.id } });
          res.status(200).json("User has been unfollowed");
        } else {
          res.status(403).json("You are not following this user!");
        }
      } catch (err) {
        return next(err);
      }
    } else {
      res.status(403).json("You can't unfollow yourself!");
    }
  },
};

export default unfollowController;
