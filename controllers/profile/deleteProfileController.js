import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import mongoose from "mongoose";

const deleteProfileController = {
  async delete(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(CustomErrorHandler.objectIdNotValid());
      }
      if (req.user._id == req.params.id || req.user.isAdmin) {
        try {
          await User.findByIdAndDelete(req.params.id);
          res.status(200).json({ status: 1 });
        } catch (err) {
          return next(err);
        }
      } else {
        return res.status(403).json({
          status: "FAILURE",
          message: "You can delete only your account",
        });
      }
    } catch (err) {
      return next(err);
    }
  },
};

export default deleteProfileController;
